from django.db import connection
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import (
    HealthMetrics, LifestyleData, PredictionResults, 
    ComplicationRisk, LifestyleRecommendation
)
import random
import sys
import os

# Add ML module to Python path
ml_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml')
if ml_path not in sys.path:
    sys.path.insert(0, ml_path)

# Import ML modules
try:
    from ml.predictor import get_predictor
    from ml.explain import explain_prediction
    ML_ENABLED = True
    print("[OK] ML modules loaded successfully")
except ImportError as e:
    ML_ENABLED = False
    print(f"Warning: ML modules not available: {e}")
    print("Falling back to rule-based prediction")


@api_view(['POST'])
def explain_risk(request):
    """
    Main endpoint for diabetes risk prediction with ML
    Creates/updates user data and returns comprehensive risk assessment
    """
    data = request.data
    
    # Get or create user (for demo, using username from request or default)
    username = data.get('username', 'demo_user')
    user, created = User.objects.get_or_create(
        username=username,
        defaults={'email': f'{username}@diaguard.ai'}
    )
    
    # Create HealthMetrics record
    health_metrics = HealthMetrics.objects.create(
        user=user,
        bmi=float(data.get('bmi', 0)),
        glucose=float(data.get('glucose', data.get('fastingGlucose', 0))),
        systolic_bp=int(data.get('systolic_bp', data.get('systolicBP', 120))),
        diastolic_bp=int(data.get('diastolic_bp', data.get('diastolicBP', 80))),
        hba1c=float(data.get('hba1c', 5.0))
    )
    
    # Convert physical activity if it's a string
    exercise_minutes = data.get('exercise_minutes', 0)
    if isinstance(exercise_minutes, str):
        activity_map = {'low': 30, 'medium': 120, 'high': 240}
        exercise_minutes = activity_map.get(exercise_minutes.lower(), 60)
    elif isinstance(data.get('physicalActivity'), str):
        activity_map = {'low': 30, 'medium': 120, 'high': 240}
        exercise_minutes = activity_map.get(data.get('physicalActivity', '').lower(), 60)
    
    # Convert smoking status if needed
    smoking = data.get('smoking_status', data.get('smokingStatus', 'never'))
    if isinstance(smoking, bool):
        smoking = 'current' if smoking else 'never'
    
    # Create LifestyleData record
    lifestyle_data = LifestyleData.objects.create(
        user=user,
        diet_pattern=data.get('diet_pattern', ''),
        exercise_minutes=int(exercise_minutes),
        sleep_hours=float(data.get('sleep_hours', data.get('sleepHours', 7))),
        stress_level=data.get('stress_level', data.get('stressLevel', 'medium')),
        smoking_status=smoking,
        family_history=bool(data.get('family_history', data.get('familyHistory', False)))
    )
    
    # Calculate risk score using ML (or rule-based fallback)
    ml_result = calculate_risk_score_ml(data)
    risk_score = ml_result['risk_score']
    risk_stage = get_risk_stage(risk_score)
    
    # Generate trend data (6-12 month projection)
    trend_data = generate_trend_data(risk_score)
    
    # Use ML explanation or generate feature importance
    if ml_result.get('explanation'):
        explanation = ml_result['explanation']
    else:
        explanation = generate_feature_importance(data)
    
    # Create PredictionResults record
    prediction = PredictionResults.objects.create(
        user=user,
        risk_score=risk_score,
        risk_stage=risk_stage,
        trend=trend_data,
        explanation=explanation,
        health_metrics=health_metrics,
        lifestyle_data=lifestyle_data
    )
    
    # Generate complication risks (ML-enhanced if available)
    complications = generate_complication_risks_ml(user, prediction, data, ml_result)
    
    # Generate lifestyle recommendations (ML-enhanced)
    recommendations = generate_lifestyle_recommendations_ml(
        prediction, data, risk_score, ml_result
    )
    
    # Prepare response
    response_data = {
        'user_id': user.id,
        'prediction_id': prediction.id,
        'risk_score': float(risk_score),
        'risk_stage': risk_stage,
        'trend': trend_data,
        'explanation': explanation,
        'top_factors': explanation,  # For frontend compatibility
        'explanation_text': ml_result.get('explanation_text', []),
        'model_used': ml_result.get('model_used', 'unknown'),
        'complications': {
            'kidney': float(complications.kidney_risk) / 100.0,
            'kidney_risk': float(complications.kidney_risk),
            'eye': float(complications.eye_risk) / 100.0,
            'eye_risk': float(complications.eye_risk),
            'nerve': float(complications.nerve_risk) / 100.0,
            'nerve_risk': float(complications.nerve_risk),
            'cardio': float(complications.cardiovascular_risk) / 100.0,
            'cardiovascular_risk': float(complications.cardiovascular_risk)
        },
        'complication_risk': {
            'kidney': float(complications.kidney_risk) / 100.0,
            'eye': float(complications.eye_risk) / 100.0,
            'nerve': float(complications.nerve_risk) / 100.0,
            'cardio': float(complications.cardiovascular_risk) / 100.0
        },
        'recommendations': [
            {
                'text': rec.recommendation_text,
                'impact': rec.impact_percentage,
                'category': rec.category,
                'priority': rec.priority
            }
            for rec in recommendations
        ],
        'timestamp': prediction.created_at.isoformat()
    }
    
    return Response(response_data, status=status.HTTP_201_CREATED)


def calculate_risk_score_ml(data):
    """
    Calculate diabetes risk score using ML model.
    Falls back to rule-based if ML not available.
    """
    if ML_ENABLED:
        try:
            # Use ML predictor
            predictor = get_predictor(model_type='logistic')
            prediction, features, features_scaled = predictor.predict_with_features(data)
            
            # Get explainability
            explanation = explain_prediction(features_scaled, features, model_type='logistic')
            
            # The ML model frequently underestimates severe lifestyle risks due to training data imbalance.
            # Blend it with the rule-based clinical heuristic for a more realistic risk scale (0-100).
            rule_based = calculate_risk_score_rule_based(data)
            clinical_score = rule_based['risk_score']
            ml_score = prediction['risk_score']
            
            final_score = max(ml_score, clinical_score)
            
            return {
                'risk_score': final_score,
                'probability': final_score / 100.0,
                'explanation': explanation['top_factors'],
                'explanation_text': explanation['explanation_text'],
                'model_used': 'ml_blended',
                'features': features,
                'features_scaled': features_scaled
            }
        except Exception as e:
            print(f"ML prediction failed: {e}. Falling back to rule-based.")
            # Fall through to rule-based
    
    # Rule-based fallback
    return calculate_risk_score_rule_based(data)


def calculate_risk_score_rule_based(data):
    """Calculate diabetes risk score based on rule-based logic (fallback)"""
    score = 0
    
    # Age contribution
    age = float(data.get('age', 40))
    if age > 65: score += 15
    elif age > 55: score += 12
    elif age > 45: score += 8
    
    # BMI contribution
    bmi = float(data.get('bmi', 0))
    if bmi > 30: score += 25
    elif bmi > 25: score += 15
    
    # Glucose contribution
    glucose = float(data.get('glucose', 0))
    if glucose > 125: score += 30
    elif glucose > 100: score += 20
    
    # HbA1c contribution
    hba1c = float(data.get('hba1c', 0))
    if hba1c > 6.5: score += 25
    elif hba1c > 5.7: score += 15
    
    # Lifestyle factors
    exercise = int(data.get('exercise_minutes', 0))
    if exercise < 30: score += 10
    
    sleep = float(data.get('sleep_hours', 7))
    if sleep < 6: score += 5
    
    # Family history
    if data.get('family_history', False): score += 10
    
    # Smoking status
    if data.get('smoking_status') == 'current': score += 10
    
    # Stress level
    stress = float(data.get('stress_level', 5))
    if stress > 7: score += 8
    
    score = min(score, 100)
    
    # Generate simple explanation for rule-based
    explanation = {}
    if glucose > 100:
        explanation['Glucose Level'] = min((glucose - 100) * 0.5, 30)
    if bmi > 25:
        explanation['BMI'] = min((bmi - 25) * 2, 25)
    if hba1c > 5.7:
        explanation['HbA1c'] = min((hba1c - 5.7) * 10, 25)
    
    return {
        'risk_score': score,
        'probability': score / 100.0,
        'explanation': explanation,
        'explanation_text': [],
        'model_used': 'rule-based',
        'features': None,
        'features_scaled': None
    }


def get_risk_stage(score):
    """Determine risk stage from score"""
    if score < 30:
        return 'normal'
    elif score < 60:
        return 'pre-diabetic'
    else:
        return 'high-risk'


def generate_trend_data(current_score):
    """Generate 12-month risk trend projection"""
    trend = []
    for month in range(1, 13):
        # Simulate gradual increase if no intervention
        projected_score = min(current_score + (month * 1.5), 100)
        trend.append({
            'month': month,
            'score': round(projected_score, 1)
        })
    return trend


def generate_feature_importance(data):
    """Generate explainable AI feature importance"""
    importance = {}
    
    bmi = float(data.get('bmi', 0))
    if bmi > 25:
        importance['BMI'] = min((bmi - 25) * 2, 35)
    
    glucose = float(data.get('glucose', 0))
    if glucose > 100:
        importance['Glucose Level'] = min((glucose - 100) * 0.5, 30)
    
    exercise = int(data.get('exercise_minutes', 0))
    if exercise < 150:
        importance['Low Physical Activity'] = min((150 - exercise) * 0.15, 20)
    
    sleep = float(data.get('sleep_hours', 7))
    if sleep < 7:
        importance['Poor Sleep'] = min((7 - sleep) * 5, 15)
    
    if data.get('family_history', False):
        importance['Family History'] = 12
    
    if data.get('smoking_status') == 'current':
        importance['Smoking'] = 10
    
    return importance


def generate_complication_risks_ml(user, prediction, data, ml_result):
    """
    Calculate and store complication risks (ML-enhanced).
    Uses ML probability if available, otherwise falls back to rule-based.
    """
    base_risk = prediction.risk_score
    probability = ml_result.get('probability', base_risk / 100.0)
    
    # ML-enhanced risk calculation
    # Base complications on ML probability with clinical adjustments
    
    # Kidney risk increases with high glucose and BP
    kidney_risk = probability * 60
    if float(data.get('systolic_bp', data.get('systolicBP', 120))) > 140:
        kidney_risk += 15
    if float(data.get('glucose', data.get('fastingGlucose', 0))) > 150:
        kidney_risk += 10
    
    # Eye risk correlates with glucose control
    eye_risk = probability * 50
    if float(data.get('hba1c', 5.0)) > 7:
        eye_risk += 20
    elif float(data.get('hba1c', 5.0)) > 6.5:
        eye_risk += 10
    
    # Nerve risk increases with duration and glucose
    nerve_risk = probability * 55
    if float(data.get('glucose', data.get('fastingGlucose', 0))) > 140:
        nerve_risk += 12
    
    # Cardiovascular risk
    cardio_risk = probability * 70
    smoking = data.get('smoking_status', data.get('smokingStatus', 'never'))
    if smoking == 'current':
        cardio_risk += 15
    elif smoking == 'former':
        cardio_risk += 5
    
    # Blood pressure impact
    bp = float(data.get('systolic_bp', data.get('systolicBP', 120)))
    if bp > 140:
        cardio_risk += 12
    elif bp > 130:
        cardio_risk += 6
    
    complication = ComplicationRisk.objects.create(
        user=user,
        prediction=prediction,
        kidney_risk=min(kidney_risk, 100),
        eye_risk=min(eye_risk, 100),
        nerve_risk=min(nerve_risk, 100),
        cardiovascular_risk=min(cardio_risk, 100)
    )
    
    return complication


def generate_lifestyle_recommendations_ml(prediction, data, risk_score, ml_result):
    """
    Generate personalized lifestyle recommendations (ML-enhanced).
    Uses ML feature importance to prioritize recommendations.
    """
    recommendations = []
    priority = 1
    
    # Get feature importance from ML if available
    explanation = ml_result.get('explanation', {})
    
    # Sort features by importance for prioritization
    important_features = sorted(
        explanation.items(), 
        key=lambda x: x[1], 
        reverse=True
    ) if explanation else []
    
    # Create a priority map based on ML insights
    feature_priority = {feat[0]: idx for idx, feat in enumerate(important_features)}
    
    # Exercise recommendation
    exercise_raw = data.get('exercise_minutes', data.get('physicalActivity', 0))
    if isinstance(exercise_raw, str):
        activity_map = {'low': 30, 'medium': 120, 'high': 240}
        exercise = activity_map.get(exercise_raw.lower(), 60)
    else:
        exercise = int(exercise_raw)
    
    if exercise < 150:
        impact = min((150 - exercise) * 0.12, 20)
        # Boost priority if physical_activity is in top features
        rec_priority = priority
        if 'physical_activity' in feature_priority and feature_priority['physical_activity'] < 3:
            impact += 5
            rec_priority = 1
        
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text="Increase physical activity to at least 150 minutes per week. Even brisk walking can significantly reduce diabetes risk.",
                impact_percentage=impact,
                priority=rec_priority,
                category="Exercise"
            )
        )
        priority += 1
    
    # Weight management (BMI)
    bmi = float(data.get('bmi', 0))
    if bmi > 25:
        impact = min((bmi - 25) * 1.5, 25)
        rec_priority = priority
        if 'bmi' in feature_priority and feature_priority['bmi'] < 3:
            impact += 5
            rec_priority = min(rec_priority, 2)
        
        weight_loss = round((bmi - 24.9) * 0.5, 1)  # Rough estimate
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text=f"Work towards gradual weight loss. Losing just 5-10% of body weight can reduce diabetes risk by up to 58%.",
                impact_percentage=impact,
                priority=rec_priority,
                category="Weight Management"
            )
        )
        priority += 1
    
    # Glucose management
    glucose = float(data.get('glucose', data.get('fastingGlucose', 0)))
    if glucose > 100:
        impact = min((glucose - 100) * 0.3, 22)
        rec_priority = priority
        if 'glucose' in feature_priority and feature_priority['glucose'] < 3:
            impact += 8
            rec_priority = 1  # Highest priority
        
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text="Reduce refined carbohydrates and sugary drinks. Focus on whole grains, vegetables, lean proteins, and healthy fats.",
                impact_percentage=impact,
                priority=rec_priority,
                category="Diet"
            )
        )
        priority += 1
    
    # Sleep recommendation
    sleep = float(data.get('sleep_hours', data.get('sleepHours', 7)))
    if sleep < 7:
        impact = (7 - sleep) * 6
        rec_priority = priority
        if 'sleep_hours' in feature_priority and feature_priority['sleep_hours'] < 5:
            impact += 4
        
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text="Aim for 7-9 hours of quality sleep per night. Poor sleep affects insulin sensitivity and metabolic health.",
                impact_percentage=impact,
                priority=rec_priority,
                category="Sleep"
            )
        )
        priority += 1
    
    # HbA1c management
    hba1c = float(data.get('hba1c', 5.0))
    if hba1c > 5.7:
        impact = min((hba1c - 5.7) * 8, 25)
        rec_priority = priority
        if 'hba1c' in feature_priority and feature_priority['hba1c'] < 3:
            impact += 6
            rec_priority = min(rec_priority, 2)
        
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text="Monitor your HbA1c levels regularly. Work with your healthcare provider on blood sugar management strategies.",
                impact_percentage=impact,
                priority=rec_priority,
                category="Medical Monitoring"
            )
        )
        priority += 1
    
    # Stress management
    stress_level = data.get('stress_level', data.get('stressLevel', 'medium'))
    if isinstance(stress_level, str):
        stress_level = stress_level.lower()
        if stress_level not in ['low', 'medium', 'high']:
            stress_level = 'medium'
    else:
        stress_level = 'high' if float(stress_level) > 7 else 'medium'
    
    if stress_level == 'high':
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text="Practice stress-reduction techniques like meditation, yoga, or deep breathing. Chronic stress affects blood sugar control.",
                impact_percentage=10,
                priority=priority,
                category="Stress Management"
            )
        )
        priority += 1
    
    # Smoking cessation
    smoking = data.get('smoking_status', data.get('smokingStatus', 'never'))
    if smoking == 'current':
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text="Quit smoking immediately. Smoking significantly increases diabetes risk and complications. Seek support from a cessation program.",
                impact_percentage=18,
                priority=1,  # Always highest priority
                category="Smoking Cessation"
            )
        )
    
    # Blood pressure management
    bp = float(data.get('systolic_bp', data.get('systolicBP', 120)))
    if bp > 130:
        impact = min((bp - 130) * 0.4, 15)
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text="Monitor blood pressure regularly. Reduce sodium intake and increase potassium-rich foods to help manage blood pressure.",
                impact_percentage=impact,
                priority=priority,
                category="Blood Pressure"
            )
        )
        priority += 1
    
    return recommendations


@api_view(['GET'])
def get_user_history(request, username):
    """Get all predictions and history for a user"""
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    predictions = PredictionResults.objects.filter(user=user).order_by('-created_at')
    
    history = []
    for pred in predictions:
        complications = pred.complications.first()
        recommendations_list = pred.recommendations.all()
        
        history.append({
            'prediction_id': pred.id,
            'risk_score': pred.risk_score,
            'risk_stage': pred.risk_stage,
            'date': pred.created_at.isoformat(),
            'complications': {
                'kidney_risk': complications.kidney_risk if complications else 0,
                'eye_risk': complications.eye_risk if complications else 0,
                'nerve_risk': complications.nerve_risk if complications else 0,
                'cardiovascular_risk': complications.cardiovascular_risk if complications else 0
            } if complications else None,
            'recommendations_count': recommendations_list.count()
        })
    
    return Response({
        'username': username,
        'total_predictions': len(history),
        'history': history
    })


@api_view(['GET'])
def get_prediction_detail(request, prediction_id):
    """Get detailed information about a specific prediction"""
    try:
        prediction = PredictionResults.objects.get(id=prediction_id)
    except PredictionResults.DoesNotExist:
        return Response({'error': 'Prediction not found'}, status=status.HTTP_404_NOT_FOUND)
    
    complications = prediction.complications.first()
    recommendations = prediction.recommendations.all()
    
    detail = {
        'prediction_id': prediction.id,
        'user': prediction.user.username,
        'risk_score': prediction.risk_score,
        'risk_stage': prediction.risk_stage,
        'trend': prediction.trend,
        'explanation': prediction.explanation,
        'date': prediction.created_at.isoformat(),
        'health_metrics': {
            'bmi': prediction.health_metrics.bmi,
            'glucose': prediction.health_metrics.glucose,
            'systolic_bp': prediction.health_metrics.systolic_bp,
            'diastolic_bp': prediction.health_metrics.diastolic_bp,
            'hba1c': prediction.health_metrics.hba1c
        } if prediction.health_metrics else None,
        'lifestyle': {
            'exercise_minutes': prediction.lifestyle_data.exercise_minutes,
            'sleep_hours': prediction.lifestyle_data.sleep_hours,
            'stress_level': prediction.lifestyle_data.stress_level,
            'smoking_status': prediction.lifestyle_data.smoking_status,
            'family_history': prediction.lifestyle_data.family_history
        } if prediction.lifestyle_data else None,
        'complications': {
            'kidney_risk': complications.kidney_risk,
            'eye_risk': complications.eye_risk,
            'nerve_risk': complications.nerve_risk,
            'cardiovascular_risk': complications.cardiovascular_risk
        } if complications else None,
        'recommendations': [
            {
                'text': rec.recommendation_text,
                'impact': rec.impact_percentage,
                'category': rec.category,
                'priority': rec.priority
            }
            for rec in recommendations
        ]
    }
    
    return Response(detail)
