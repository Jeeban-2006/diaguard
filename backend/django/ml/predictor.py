"""
ML Predictor Module for DiaguARd
Loads trained models and makes diabetes risk predictions.
"""

import os
import numpy as np
import joblib
from typing import Dict, Union, Tuple


class DiabetesRiskPredictor:
    """
    Diabetes risk prediction model loader and predictor.
    """
    
    def __init__(self, model_type='logistic'):
        """
        Initialize the predictor.
        
        Args:
            model_type: 'logistic' or 'random_forest'
        """
        self.model_type = model_type
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.metadata = None
        self._load_models()
    
    def _load_models(self):
        """Load trained model, scaler, and feature names from disk."""
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        try:
            # Load model
            if self.model_type == 'logistic':
                model_path = os.path.join(script_dir, 'diabetes_model.pkl')
            else:
                model_path = os.path.join(script_dir, 'diabetes_model_rf.pkl')
            
            if not os.path.exists(model_path):
                raise FileNotFoundError(
                    f"Model file not found: {model_path}. "
                    "Please run train_model.py first."
                )
            
            self.model = joblib.load(model_path)
            
            # Load scaler
            scaler_path = os.path.join(script_dir, 'scaler.pkl')
            self.scaler = joblib.load(scaler_path)
            
            # Load feature names
            feature_names_path = os.path.join(script_dir, 'feature_names.pkl')
            self.feature_names = joblib.load(feature_names_path)
            
            # Load metadata
            metadata_path = os.path.join(script_dir, 'model_metadata.pkl')
            if os.path.exists(metadata_path):
                self.metadata = joblib.load(metadata_path)
            
            print(f"✓ Loaded {self.model_type} model successfully")
            
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {str(e)}")
    
    def prepare_features(self, health_data: Dict) -> np.ndarray:
        """
        Prepare input features from health data dictionary.
        
        Args:
            health_data: Dictionary containing health metrics
            
        Returns:
            numpy array of features in correct order
        """
        # Map frontend field names to model feature names
        feature_mapping = {
            'age': 'age',
            'bmi': 'bmi',
            'glucose': 'glucose',
            'fastingGlucose': 'glucose',
            'systolic_bp': 'blood_pressure',
            'systolicBP': 'blood_pressure',
            'hba1c': 'hba1c',
            'exercise_minutes': 'physical_activity',
            'physicalActivity': 'physical_activity',
            'sleep_hours': 'sleep_hours',
            'sleepHours': 'sleep_hours',
            'stress_level': 'stress_level',
            'stressLevel': 'stress_level',
            'smoking_status': 'smoking',
            'smokingStatus': 'smoking',
            'family_history': 'family_history',
            'familyHistory': 'family_history'
        }
        
        # Convert physical activity levels to minutes
        activity_to_minutes = {
            'low': 30,
            'medium': 120,
            'high': 240
        }
        
        # Convert smoking status to numeric
        smoking_to_numeric = {
            'never': 0,
            'former': 1,
            'current': 2
        }

        stress_to_numeric = {
            'low': 3,
            'medium': 5,
            'high': 8
        }
        
        features = {}
        
        for key, value in health_data.items():
            # Find the corresponding feature name
            feature_name = feature_mapping.get(key, key)
            
            if feature_name in self.feature_names:
                # Handle special conversions
                if feature_name == 'physical_activity' and isinstance(value, str):
                    value = activity_to_minutes.get(value.lower(), 60)
                elif feature_name == 'smoking' and isinstance(value, str):
                    value = smoking_to_numeric.get(value.lower(), 0)
                elif feature_name == 'family_history' and isinstance(value, bool):
                    value = 1 if value else 0
                elif feature_name == 'stress_level' and isinstance(value, (int, float)):
                    # Stress level might be 1-10 scale or a string
                    value = float(value)
                elif feature_name == 'stress_level' and isinstance(value, str):
                    value = stress_to_numeric.get(value.lower(), 5)
                
                features[feature_name] = float(value)
        
        # Create feature array in correct order
        feature_array = []
        for feature_name in self.feature_names:
            if feature_name in features:
                feature_array.append(features[feature_name])
            else:
                # Use default values if feature is missing
                defaults = {
                    'age': 40,
                    'bmi': 25,
                    'glucose': 100,
                    'blood_pressure': 120,
                    'hba1c': 5.7,
                    'physical_activity': 60,
                    'sleep_hours': 7,
                    'stress_level': 5,
                    'smoking': 0,
                    'family_history': 0
                }
                feature_array.append(defaults.get(feature_name, 0))
        
        return np.array(feature_array).reshape(1, -1)
    
    def predict_risk(self, health_data: Dict) -> Dict[str, Union[float, str]]:
        """
        Predict diabetes risk from health data.
        
        Args:
            health_data: Dictionary containing health metrics
            
        Returns:
            Dictionary with risk_score (0-100) and risk_stage
        """
        # Prepare features
        features = self.prepare_features(health_data)
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Get prediction probability
        probability = self.model.predict_proba(features_scaled)[0, 1]
        
        # Convert probability to risk score (0-100)
        risk_score = round(probability * 100, 1)
        
        # Determine risk stage
        if risk_score < 30:
            risk_stage = 'normal'
        elif risk_score < 60:
            risk_stage = 'pre-diabetic'
        else:
            risk_stage = 'high-risk'
        
        return {
            'risk_score': risk_score,
            'risk_stage': risk_stage,
            'probability': probability,
            'model_type': self.model_type
        }
    
    def predict_with_features(self, health_data: Dict) -> Tuple[Dict, np.ndarray, np.ndarray]:
        """
        Predict risk and return features for explainability.
        
        Args:
            health_data: Dictionary containing health metrics
            
        Returns:
            Tuple of (prediction_dict, features, features_scaled)
        """
        features = self.prepare_features(health_data)
        features_scaled = self.scaler.transform(features)
        
        probability = self.model.predict_proba(features_scaled)[0, 1]
        risk_score = round(probability * 100, 1)
        
        if risk_score < 30:
            risk_stage = 'normal'
        elif risk_score < 60:
            risk_stage = 'pre-diabetic'
        else:
            risk_stage = 'high-risk'
        
        prediction = {
            'risk_score': risk_score,
            'risk_stage': risk_stage,
            'probability': probability,
            'model_type': self.model_type
        }
        
        return prediction, features, features_scaled
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model."""
        info = {
            'model_type': self.model_type,
            'feature_names': self.feature_names,
            'n_features': len(self.feature_names)
        }
        
        if self.metadata:
            info.update(self.metadata)
        
        return info


# Global predictor instance (singleton pattern for efficiency)
_predictor = None


def get_predictor(model_type='logistic') -> DiabetesRiskPredictor:
    """
    Get or create the global predictor instance.
    
    Args:
        model_type: 'logistic' or 'random_forest'
        
    Returns:
        DiabetesRiskPredictor instance
    """
    global _predictor
    
    if _predictor is None or _predictor.model_type != model_type:
        _predictor = DiabetesRiskPredictor(model_type=model_type)
    
    return _predictor


def predict_diabetes_risk(health_data: Dict, model_type='logistic') -> Dict:
    """
    Convenience function to predict diabetes risk.
    
    Args:
        health_data: Dictionary containing health metrics
        model_type: 'logistic' or 'random_forest'
        
    Returns:
        Dictionary with prediction results
    """
    predictor = get_predictor(model_type=model_type)
    return predictor.predict_risk(health_data)


if __name__ == '__main__':
    # Test the predictor
    print("Testing DiaguARd ML Predictor...")
    
    # Sample health data
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
        result = predict_diabetes_risk(sample_data)
        print("\nPrediction Result:")
        print(f"  Risk Score: {result['risk_score']}")
        print(f"  Risk Stage: {result['risk_stage']}")
        print(f"  Probability: {result['probability']:.4f}")
        print(f"  Model Type: {result['model_type']}")
        print("\n✓ Predictor test successful!")
    except Exception as e:
        print(f"\n✗ Predictor test failed: {str(e)}")
        print("  Make sure to run train_model.py first!")
