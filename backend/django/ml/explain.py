"""
Explainable AI Module for DiaguARd
Uses SHAP (SHapley Additive exPlanations) to explain model predictions.
"""

import os
import numpy as np
import joblib
from typing import Dict, List, Tuple
import warnings

warnings.filterwarnings('ignore')

try:
    import shap  # type: ignore[import-not-found]
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("Warning: SHAP not installed. Install with: pip install shap")


class DiabetesExplainer:
    """
    Provides explainability for diabetes risk predictions using SHAP.
    """
    
    def __init__(self, model_type='logistic'):
        """
        Initialize the explainer.
        
        Args:
            model_type: 'logistic' or 'random_forest'
        """
        self.model_type = model_type
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.explainer = None
        self._load_models()
        self._create_explainer()
    
    def _load_models(self):
        """Load trained model, scaler, and feature names."""
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load model
        if self.model_type == 'logistic':
            model_path = os.path.join(script_dir, 'diabetes_model.pkl')
        else:
            model_path = os.path.join(script_dir, 'diabetes_model_rf.pkl')
        
        self.model = joblib.load(model_path)
        
        # Load scaler
        scaler_path = os.path.join(script_dir, 'scaler.pkl')
        self.scaler = joblib.load(scaler_path)
        
        # Load feature names
        feature_names_path = os.path.join(script_dir, 'feature_names.pkl')
        self.feature_names = joblib.load(feature_names_path)
    
    def _create_explainer(self):
        """Create SHAP explainer based on model type."""
        if not SHAP_AVAILABLE:
            print("Warning: SHAP not available. Falling back to coefficient-based explanation.")
            return
        
        try:
            if self.model_type == 'logistic':
                # For linear models, use Linear explainer (fastest)
                self.explainer = shap.LinearExplainer(self.model, self.scaler.mean_.reshape(1, -1))
            else:
                # For tree-based models, use Tree explainer
                self.explainer = shap.TreeExplainer(self.model)
            
            print(f"✓ SHAP {self.explainer.__class__.__name__} initialized")
        except Exception as e:
            print(f"Warning: Could not create SHAP explainer: {str(e)}")
            self.explainer = None
    
    def explain_prediction_shap(self, features_scaled: np.ndarray) -> Dict[str, float]:
        """
        Generate feature importance using SHAP values.
        
        Args:
            features_scaled: Scaled feature array (1, n_features)
            
        Returns:
            Dictionary mapping feature names to importance scores
        """
        if not SHAP_AVAILABLE or self.explainer is None:
            return self._fallback_explanation(features_scaled)
        
        try:
            # Compute SHAP values
            shap_values = self.explainer.shap_values(features_scaled)
            
            # For binary classification, take the positive class
            if isinstance(shap_values, list):
                shap_values = shap_values[1]
            
            # Get absolute values for importance ranking
            shap_abs = np.abs(shap_values[0])
            
            # Create feature importance dictionary
            importance = {}
            for i, feature_name in enumerate(self.feature_names):
                importance[feature_name] = float(shap_abs[i])
            
            # Normalize to percentages
            total = sum(importance.values())
            if total > 0:
                importance = {k: (v / total) * 100 for k, v in importance.items()}
            
            return importance
            
        except Exception as e:
            print(f"Warning: SHAP explanation failed: {str(e)}")
            return self._fallback_explanation(features_scaled)
    
    def _fallback_explanation(self, features_scaled: np.ndarray) -> Dict[str, float]:
        """
        Fallback explanation method using model coefficients or feature importances.
        
        Args:
            features_scaled: Scaled feature array
            
        Returns:
            Feature importance dictionary
        """
        importance = {}
        
        if hasattr(self.model, 'coef_'):
            # Logistic Regression: use coefficients * feature values
            coefficients = self.model.coef_[0]
            feature_contributions = np.abs(coefficients * features_scaled[0])
            
            for i, feature_name in enumerate(self.feature_names):
                importance[feature_name] = float(feature_contributions[i])
        
        elif hasattr(self.model, 'feature_importances_'):
            # Random Forest: use feature importances
            for i, feature_name in enumerate(self.feature_names):
                importance[feature_name] = float(self.model.feature_importances_[i])
        
        else:
            # Generic fallback: equal importance
            for feature_name in self.feature_names:
                importance[feature_name] = 1.0 / len(self.feature_names)
        
        # Normalize to percentages
        total = sum(importance.values())
        if total > 0:
            importance = {k: (v / total) * 100 for k, v in importance.items()}
        
        return importance
    
    def get_top_features(
        self, 
        importance: Dict[str, float], 
        n: int = 5
    ) -> Dict[str, float]:
        """
        Get top N most important features.
        
        Args:
            importance: Feature importance dictionary
            n: Number of top features to return
            
        Returns:
            Dictionary with top N features and their importance
        """
        sorted_features = sorted(
            importance.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        return dict(sorted_features[:n])
    
    def generate_explanation_text(
        self, 
        importance: Dict[str, float], 
        features: np.ndarray,
        n: int = 3
    ) -> List[str]:
        """
        Generate human-readable explanation text.
        
        Args:
            importance: Feature importance dictionary
            features: Raw feature values
            n: Number of features to explain
            
        Returns:
            List of explanation strings
        """
        top_features = self.get_top_features(importance, n)
        explanations = []
        
        # Create feature name mapping for better readability
        feature_labels = {
            'age': 'Age',
            'bmi': 'BMI',
            'glucose': 'Blood Glucose Level',
            'blood_pressure': 'Blood Pressure',
            'hba1c': 'HbA1c Level',
            'physical_activity': 'Physical Activity',
            'sleep_hours': 'Sleep Duration',
            'stress_level': 'Stress Level',
            'smoking': 'Smoking Status',
            'family_history': 'Family History'
        }
        
        for feature_name, score in top_features.items():
            label = feature_labels.get(feature_name, feature_name)
            
            # Get feature value
            feature_idx = self.feature_names.index(feature_name)
            value = features[0, feature_idx]
            
            # Generate contextual explanation
            if feature_name == 'bmi':
                if value > 30:
                    context = "significantly elevated"
                elif value > 25:
                    context = "above healthy range"
                else:
                    context = "within normal range"
                explanations.append(f"{label} is {context} ({value:.1f})")
            
            elif feature_name == 'glucose':
                if value > 125:
                    context = "in diabetic range"
                elif value > 100:
                    context = "elevated (pre-diabetic range)"
                else:
                    context = "normal"
                explanations.append(f"{label} is {context} ({value:.0f} mg/dL)")
            
            elif feature_name == 'hba1c':
                if value > 6.5:
                    context = "indicates diabetes"
                elif value > 5.7:
                    context = "indicates prediabetes"
                else:
                    context = "normal"
                explanations.append(f"{label} {context} ({value:.1f}%)")
            
            elif feature_name == 'physical_activity':
                if value < 60:
                    context = "below recommended levels"
                elif value < 150:
                    context = "moderate but could improve"
                else:
                    context = "excellent"
                explanations.append(f"{label} is {context} ({value:.0f} min/week)")
            
            elif feature_name == 'sleep_hours':
                if value < 6:
                    context = "insufficient"
                elif value < 7:
                    context = "below optimal"
                else:
                    context = "adequate"
                explanations.append(f"{label} is {context} ({value:.1f} hours/night)")
            
            else:
                explanations.append(f"{label} contributing {score:.1f}%")
        
        return explanations


# Global explainer instance
_explainer = None


def get_explainer(model_type='logistic') -> DiabetesExplainer:
    """
    Get or create the global explainer instance.
    
    Args:
        model_type: 'logistic' or 'random_forest'
        
    Returns:
        DiabetesExplainer instance
    """
    global _explainer
    
    if _explainer is None or _explainer.model_type != model_type:
        _explainer = DiabetesExplainer(model_type=model_type)
    
    return _explainer


def explain_prediction(
    features_scaled: np.ndarray,
    features_raw: np.ndarray,
    model_type: str = 'logistic',
    n_features: int = 5
) -> Dict:
    """
    Explain a diabetes risk prediction.
    
    Args:
        features_scaled: Scaled features (for model)
        features_raw: Raw features (for display)
        model_type: Model type
        n_features: Number of top features to return
        
    Returns:
        Dictionary with explanation data
    """
    explainer = get_explainer(model_type=model_type)
    
    # Get feature importance
    importance = explainer.explain_prediction_shap(features_scaled)
    
    # Get top features
    top_features = explainer.get_top_features(importance, n_features)
    
    # Generate explanation text
    explanation_text = explainer.generate_explanation_text(
        importance, 
        features_raw, 
        n=min(3, n_features)
    )
    
    return {
        'feature_importance': importance,
        'top_factors': top_features,
        'explanation_text': explanation_text
    }


if __name__ == '__main__':
    # Test the explainer
    print("Testing DiaguARd Explainer...")
    
    from predictor import get_predictor
    
    # Sample data
    sample_data = {
        'age': 55,
        'bmi': 32,
        'glucose': 140,
        'systolic_bp': 145,
        'hba1c': 6.8,
        'physicalActivity': 'low',
        'sleep_hours': 5.5,
        'stress_level': 8,
        'smoking_status': 'former',
        'family_history': True
    }
    
    try:
        # Get prediction with features
        predictor = get_predictor()
        prediction, features, features_scaled = predictor.predict_with_features(sample_data)
        
        # Explain prediction
        explanation = explain_prediction(features_scaled, features)
        
        print("\nPrediction Explanation:")
        print(f"  Risk Score: {prediction['risk_score']}")
        print(f"  Risk Stage: {prediction['risk_stage']}")
        print("\n  Top Contributing Factors:")
        for feature, importance in explanation['top_factors'].items():
            print(f"    {feature}: {importance:.1f}%")
        
        print("\n  Explanation:")
        for text in explanation['explanation_text']:
            print(f"    • {text}")
        
        print("\n✓ Explainer test successful!")
        
    except Exception as e:
        print(f"\n✗ Explainer test failed: {str(e)}")
        print("  Make sure to run train_model.py first!")
