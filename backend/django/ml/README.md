# DiaguARd Machine Learning Integration

## Overview

This directory contains the machine learning pipeline for diabetes risk prediction with explainable AI capabilities.

## Architecture

```
ml/
├── __init__.py           # Module initialization
├── requirements.txt      # ML dependencies
├── train_model.py        # Model training script
├── predictor.py          # Prediction engine
├── explain.py            # SHAP explainability
├── diabetes_model.pkl    # Trained Logistic Regression model
├── diabetes_model_rf.pkl # Trained Random Forest model
├── scaler.pkl            # Feature scaler (StandardScaler)
├── feature_names.pkl     # Feature name list
└── model_metadata.pkl    # Model metadata
```

## Features

### 1. Machine Learning Models
- **Primary Model**: Logistic Regression (fast, interpretable)
- **Secondary Model**: Random Forest (higher accuracy)
- Both models use StandardScaler for feature normalization

### 2. Input Features (10 features)
1. `age` - Patient age (20-80 years)
2. `bmi` - Body Mass Index (15-50)
3. `glucose` - Fasting blood glucose (60-200 mg/dL)
4. `blood_pressure` - Systolic blood pressure (80-200 mmHg)
5. `hba1c` - HbA1c percentage (4.0-12.0%)
6. `physical_activity` - Exercise minutes per week (0-300)
7. `sleep_hours` - Average sleep hours (3-12)
8. `stress_level` - Stress level (1-10 scale)
9. `smoking` - Smoking status (0=never, 1=former, 2=current)
10. `family_history` - Family history of diabetes (0=no, 1=yes)

### 3. Outputs
- **Risk Score**: 0-100 scale
- **Risk Stage**: Normal (<30), Pre-diabetic (30-59), High Risk (60+)
- **Feature Importance**: SHAP-based explanation of top risk factors
- **Explainability Text**: Human-readable explanations

### 4. Explainable AI
- Uses SHAP (SHapley Additive exPlanations)
- Provides feature importance rankings
- Generates contextual explanations for predictions

## Installation

### 1. Install ML Dependencies

```bash
cd backend/django/ml
pip install -r requirements.txt
```

Required packages:
- scikit-learn==1.3.2
- pandas==2.1.4
- numpy==1.26.2
- shap==0.44.0
- matplotlib==3.8.2
- joblib==1.3.2

### 2. Train the Models

```bash
cd backend/django/ml
python train_model.py
```

This will:
- Generate a synthetic diabetes dataset (1000 samples)
- Train Logistic Regression and Random Forest models
- Evaluate model performance
- Save trained models and artifacts

Expected output:
```
DiaguARd ML Training Pipeline
==============================
[1/6] Generating synthetic diabetes dataset...
[2/6] Splitting features and target...
[3/6] Creating train-test split (80-20)...
[4/6] Normalizing features with StandardScaler...
[5/6] Training Logistic Regression model...
      Accuracy: ~0.75-0.85
      ROC-AUC: ~0.80-0.90
[6/6] Saving models and artifacts...
✓ Training complete!
```

### 3. Verify Installation

Test the predictor:
```bash
python predictor.py
```

Test the explainer:
```bash
python explain.py
```

## Usage

### In Django Views

```python
from ml.predictor import get_predictor
from ml.explain import explain_prediction

# Get predictor
predictor = get_predictor(model_type='logistic')

# Make prediction
health_data = {
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

# Predict with features for explainability
prediction, features, features_scaled = predictor.predict_with_features(health_data)

# Get explanation
explanation = explain_prediction(features_scaled, features)

print(f"Risk Score: {prediction['risk_score']}")
print(f"Risk Stage: {prediction['risk_stage']}")
print(f"Top Factors: {explanation['top_factors']}")
```

### API Response Format

The ML pipeline integrates seamlessly with the existing API structure:

```json
{
  "risk_score": 64.5,
  "risk_stage": "pre-diabetic",
  "model_used": "ml",
  "top_factors": {
    "glucose": 28.5,
    "bmi": 24.3,
    "hba1c": 18.7,
    "physical_activity": 12.1,
    "sleep_hours": 8.4
  },
  "explanation_text": [
    "Blood Glucose Level is elevated (pre-diabetic range) (140 mg/dL)",
    "BMI is above healthy range (32.0)",
    "Physical Activity is below recommended levels (30 min/week)"
  ],
  "complications": {
    "kidney": 0.41,
    "eye": 0.33,
    "nerve": 0.29,
    "cardio": 0.48
  },
  "recommendations": [...]
}
```

## Model Performance

### Logistic Regression
- **Accuracy**: ~75-85% on test set
- **ROC-AUC**: ~80-90%
- **Inference Time**: <5ms per prediction
- **Interpretability**: High (linear coefficients)

### Random Forest
- **Accuracy**: ~78-88% on test set
- **ROC-AUC**: ~82-92%
- **Inference Time**: <10ms per prediction
- **Interpretability**: Medium (feature importances)

## Fallback Mechanism

The system includes automatic fallback to rule-based prediction if:
- ML models are not trained
- Model files are missing
- Prediction fails for any reason

This ensures the API remains operational even without ML.

## Retraining Models

To retrain with new data:

1. Update `generate_synthetic_dataset()` in `train_model.py`
2. Or replace with real dataset loading
3. Run: `python train_model.py`
4. Restart Django server to load new models

## Clinical Validation

**Important**: The current models are trained on synthetic data for demonstration purposes. Before deploying to production:

1. ✅ Train on validated clinical datasets (e.g., Pima Indians, NHANES)
2. ✅ Validate with medical experts
3. ✅ Test on diverse populations
4. ✅ Implement continuous monitoring
5. ✅ Add regulatory compliance (HIPAA, FDA guidelines)

## Troubleshooting

### Issue: "Model file not found"
**Solution**: Run `python train_model.py` first

### Issue: "SHAP not available"
**Solution**: Install SHAP: `pip install shap`
Falls back to coefficient-based explanation if SHAP unavailable

### Issue: Low model accuracy
**Solution**: 
- Increase training data size
- Add more diverse samples
- Tune hyperparameters
- Feature engineering

### Issue: Import errors in Django
**Solution**: Ensure ML path is added to sys.path in views.py

## Future Enhancements

- [ ] Integration with real clinical datasets
- [ ] Deep learning models (Neural Networks)
- [ ] Time-series predictions (progression tracking)
- [ ] Multi-class classification (fine-grained risk levels)
- [ ] Model versioning and A/B testing
- [ ] Automated retraining pipeline
- [ ] Model performance monitoring dashboard
- [ ] LIME explainability (alternative to SHAP)
- [ ] Fairness and bias analysis
- [ ] Model uncertainty quantification

## References

- SHAP: https://github.com/slundberg/shap
- scikit-learn: https://scikit-learn.org/
- Diabetes Risk Prediction: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6371873/

## License

See main project LICENSE file.
