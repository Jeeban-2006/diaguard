from django.db import models
from django.contrib.auth.models import User


class HealthMetrics(models.Model):
    """Stores health-related measurements for each user"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_metrics')
    bmi = models.FloatField()
    glucose = models.FloatField(help_text="Blood glucose level (mg/dL)")
    systolic_bp = models.IntegerField(help_text="Systolic blood pressure")
    diastolic_bp = models.IntegerField(help_text="Diastolic blood pressure")
    hba1c = models.FloatField(help_text="HbA1c percentage")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Health Metric"
        verbose_name_plural = "Health Metrics"
        ordering = ['-created_at']

    def __str__(self):
        return f"Health Metrics for {self.user.username} - {self.created_at.strftime('%Y-%m-%d')}"


class LifestyleData(models.Model):
    """Stores lifestyle-related information for each user"""
    SMOKING_CHOICES = [
        ('never', 'Never'),
        ('former', 'Former'),
        ('current', 'Current'),
    ]
    
    STRESS_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lifestyle_data')
    diet_pattern = models.CharField(max_length=100, blank=True)
    exercise_minutes = models.IntegerField(help_text="Daily exercise in minutes")
    sleep_hours = models.FloatField(help_text="Average sleep hours per night")
    stress_level = models.CharField(max_length=20, choices=STRESS_CHOICES)
    smoking_status = models.CharField(max_length=20, choices=SMOKING_CHOICES, default='never')
    family_history = models.BooleanField(default=False, help_text="Family history of diabetes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Lifestyle Data"
        verbose_name_plural = "Lifestyle Data"
        ordering = ['-created_at']

    def __str__(self):
        return f"Lifestyle Data for {self.user.username} - {self.created_at.strftime('%Y-%m-%d')}"


class PredictionResults(models.Model):
    """Stores diabetes risk prediction results"""
    RISK_STAGES = [
        ('normal', 'Normal'),
        ('pre-diabetic', 'Pre-diabetic'),
        ('high-risk', 'High Risk'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    risk_score = models.FloatField(help_text="Risk score (0-100)")
    risk_stage = models.CharField(max_length=20, choices=RISK_STAGES)
    trend = models.JSONField(help_text="6-12 month risk trend data", null=True, blank=True)
    explanation = models.JSONField(help_text="Explainable AI feature importance", null=True, blank=True)
    health_metrics = models.ForeignKey(HealthMetrics, on_delete=models.SET_NULL, null=True)
    lifestyle_data = models.ForeignKey(LifestyleData, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Prediction Result"
        verbose_name_plural = "Prediction Results"
        ordering = ['-created_at']

    def __str__(self):
        return f"Prediction for {self.user.username} - {self.risk_stage} ({self.risk_score}%)"


class ComplicationRisk(models.Model):
    """Stores complication risk predictions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complication_risks')
    prediction = models.ForeignKey(PredictionResults, on_delete=models.CASCADE, related_name='complications')
    kidney_risk = models.FloatField(help_text="Kidney complication risk (0-100)")
    eye_risk = models.FloatField(help_text="Eye damage risk (0-100)")
    nerve_risk = models.FloatField(help_text="Neuropathy risk (0-100)")
    cardiovascular_risk = models.FloatField(help_text="Heart disease risk (0-100)", default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Complication Risk"
        verbose_name_plural = "Complication Risks"
        ordering = ['-created_at']

    def __str__(self):
        return f"Complication Risks for {self.user.username} - {self.created_at.strftime('%Y-%m-%d')}"


class LifestyleRecommendation(models.Model):
    """Stores personalized lifestyle recommendations"""
    prediction = models.ForeignKey(PredictionResults, on_delete=models.CASCADE, related_name='recommendations')
    recommendation_text = models.TextField()
    impact_percentage = models.FloatField(help_text="Expected risk reduction %")
    priority = models.IntegerField(help_text="Priority order (1=highest)")
    category = models.CharField(max_length=50, help_text="e.g., Exercise, Diet, Sleep")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Lifestyle Recommendation"
        verbose_name_plural = "Lifestyle Recommendations"
        ordering = ['priority']

    def __str__(self):
        return f"{self.category}: {self.recommendation_text[:50]}..."
