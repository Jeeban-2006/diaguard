from django.contrib import admin
from .models import (
    HealthMetrics, LifestyleData, PredictionResults,
    ComplicationRisk, LifestyleRecommendation
)


@admin.register(HealthMetrics)
class HealthMetricsAdmin(admin.ModelAdmin):
    list_display = ['user', 'bmi', 'glucose', 'hba1c', 'created_at']
    list_filter = ['created_at', 'user']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(LifestyleData)
class LifestyleDataAdmin(admin.ModelAdmin):
    list_display = ['user', 'exercise_minutes', 'sleep_hours', 'stress_level', 'smoking_status', 'created_at']
    list_filter = ['stress_level', 'smoking_status', 'family_history', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PredictionResults)
class PredictionResultsAdmin(admin.ModelAdmin):
    list_display = ['user', 'risk_score', 'risk_stage', 'created_at']
    list_filter = ['risk_stage', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']


@admin.register(ComplicationRisk)
class ComplicationRiskAdmin(admin.ModelAdmin):
    list_display = ['user', 'kidney_risk', 'eye_risk', 'nerve_risk', 'cardiovascular_risk', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']


@admin.register(LifestyleRecommendation)
class LifestyleRecommendationAdmin(admin.ModelAdmin):
    list_display = ['prediction', 'category', 'priority', 'impact_percentage', 'created_at']
    list_filter = ['category', 'priority', 'created_at']
    search_fields = ['recommendation_text', 'prediction__user__username']
    readonly_fields = ['created_at']
