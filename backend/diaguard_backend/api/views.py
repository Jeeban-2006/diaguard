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


@api_view(['POST'])
def explain_risk(request):
    """
    Main endpoint for diabetes risk prediction
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
        glucose=float(data.get('glucose', 0)),
        systolic_bp=int(data.get('systolic_bp', 120)),
        diastolic_bp=int(data.get('diastolic_bp', 80)),
        hba1c=float(data.get('hba1c', 5.0))
    )
    
    # Create LifestyleData record
    lifestyle_data = LifestyleData.objects.create(
        user=user,
        diet_pattern=data.get('diet_pattern', ''),
        exercise_minutes=int(data.get('exercise_minutes', 0)),
        sleep_hours=float(data.get('sleep_hours', 7)),
        stress_level=data.get('stress_level', 'medium'),
        smoking_status=data.get('smoking_status', 'never'),
        family_history=bool(data.get('family_history', False))
    )
    
    # Calculate risk score (simplified ML logic for demo)
    risk_score = calculate_risk_score(data)
    risk_stage = get_risk_stage(risk_score)
    
    # Generate trend data (6-12 month projection)
    trend_data = generate_trend_data(risk_score)
    
    # Generate explainable AI features
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
    
    # Generate complication risks
    complications = generate_complication_risks(user, prediction, data)
    
    # Generate lifestyle recommendations
    recommendations = generate_lifestyle_recommendations(prediction, data, risk_score)
    
    # Prepare response
    response_data = {
        'user_id': user.id,
        'prediction_id': prediction.id,
        'risk_score': risk_score,
        'risk_stage': risk_stage,
        'trend': trend_data,
        'explanation': explanation,
        'complications': {
            'kidney_risk': complications.kidney_risk,
            'eye_risk': complications.eye_risk,
            'nerve_risk': complications.nerve_risk,
            'cardiovascular_risk': complications.cardiovascular_risk
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


def calculate_risk_score(data):
    """Calculate diabetes risk score based on input factors"""
    score = 0
    
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
    
    return min(score, 100)


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


def generate_complication_risks(user, prediction, data):
    """Calculate and store complication risks"""
    base_risk = prediction.risk_score
    
    # Kidney risk increases with high glucose and BP
    kidney_risk = base_risk * 0.6
    if float(data.get('systolic_bp', 120)) > 140:
        kidney_risk += 15
    
    # Eye risk correlates with glucose control
    eye_risk = base_risk * 0.5
    if float(data.get('hba1c', 5.0)) > 7:
        eye_risk += 20
    
    # Nerve risk increases with duration and glucose
    nerve_risk = base_risk * 0.55
    
    # Cardiovascular risk
    cardio_risk = base_risk * 0.7
    if data.get('smoking_status') == 'current':
        cardio_risk += 15
    
    complication = ComplicationRisk.objects.create(
        user=user,
        prediction=prediction,
        kidney_risk=min(kidney_risk, 100),
        eye_risk=min(eye_risk, 100),
        nerve_risk=min(nerve_risk, 100),
        cardiovascular_risk=min(cardio_risk, 100)
    )
    
    return complication


def generate_lifestyle_recommendations(prediction, data, risk_score):
    """Generate personalized lifestyle recommendations"""
    recommendations = []
    priority = 1
    
    # Exercise recommendation
    exercise = int(data.get('exercise_minutes', 0))
    if exercise < 150:
        impact = min((150 - exercise) * 0.12, 20)
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text=f"Increase daily physical activity to 30 minutes per day. Even brisk walking can reduce your risk significantly.",
                impact_percentage=impact,
                priority=priority,
                category="Exercise"
            )
        )
        priority += 1
    
    # Weight management
    bmi = float(data.get('bmi', 0))
    if bmi > 25:
        impact = min((bmi - 25) * 1.5, 25)
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text=f"Focus on gradual weight loss. Losing 5-10% of body weight can reduce diabetes risk by up to 58%.",
                impact_percentage=impact,
                priority=priority,
                category="Weight Management"
            )
        )
        priority += 1
    
    # Sleep recommendation
    sleep = float(data.get('sleep_hours', 7))
    if sleep < 7:
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text="Aim for 7-9 hours of quality sleep per night. Poor sleep affects insulin sensitivity.",
                impact_percentage=12,
                priority=priority,
                category="Sleep"
            )
        )
        priority += 1
    
    # Diet recommendation
    if float(data.get('glucose', 0)) > 100:
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text="Reduce refined carbohydrates and sugary drinks. Focus on whole grains, vegetables, and lean proteins.",
                impact_percentage=18,
                priority=priority,
                category="Diet"
            )
        )
        priority += 1
    
    # Stress management
    if data.get('stress_level') == 'high':
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text="Practice stress-reduction techniques like meditation, yoga, or deep breathing exercises.",
                impact_percentage=10,
                priority=priority,
                category="Stress Management"
            )
        )
        priority += 1
    
    # Smoking cessation
    if data.get('smoking_status') == 'current':
        recommendations.append(
            LifestyleRecommendation.objects.create(
                prediction=prediction,
                recommendation_text="Quit smoking immediately. Smoking significantly increases diabetes risk and complications.",
                impact_percentage=15,
                priority=1,  # Highest priority
                category="Smoking Cessation"
            )
        )
    
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
