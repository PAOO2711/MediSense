"""
Script de prueba para el análisis médico con IA
"""
import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.ai_analysis import medical_analysis_service

# Transcripción de ejemplo
transcripcion_ejemplo = """
Paciente de 35 años que viene a consulta por dolor de cabeza intenso que lleva 3 días.
El dolor es pulsátil, principalmente en el lado derecho. También menciona que tiene 
náuseas y sensibilidad a la luz. Dice que el dolor empeora cuando se mueve. 
No ha tenido fiebre. Ha estado tomando paracetamol pero no le ha ayudado mucho.
Menciona que está bajo mucho estrés en el trabajo últimamente.
"""

def test_analysis():
    """Prueba el análisis médico"""
    print("🧪 Probando análisis médico con IA...\n")
    print(f"📝 Transcripción de prueba:\n{transcripcion_ejemplo}\n")
    print("="*80)
    
    try:
        # Analizar
        resultado = medical_analysis_service.analyze_transcription(
            transcription=transcripcion_ejemplo,
            patient_context="Paciente sin antecedentes relevantes"
        )
        
        print("\n✅ ANÁLISIS COMPLETADO\n")
        print("="*80)
        
        print(f"\n📋 RESUMEN:")
        print(f"{resultado.resumen}\n")
        
        print(f"🎯 NIVEL DE URGENCIA: {resultado.nivel_urgencia}\n")
        
        print(f"🔍 SÍNTOMAS IDENTIFICADOS ({len(resultado.sintomas_identificados)}):")
        for i, sintoma in enumerate(resultado.sintomas_identificados, 1):
            print(f"\n  {i}. {sintoma.nombre}")
            print(f"     Severidad: {sintoma.severidad}")
            print(f"     Duración: {sintoma.duracion_estimada}")
            print(f"     Descripción: {sintoma.descripcion}")
        
        print(f"\n💡 SUGERENCIAS PARA EL MÉDICO ({len(resultado.sugerencias)}):")
        for i, sug in enumerate(resultado.sugerencias, 1):
            print(f"\n  {i}. [{sug.tipo}] - Prioridad: {sug.prioridad}")
            print(f"     {sug.contenido}")
            print(f"     Justificación: {sug.justificacion}")
        
        print(f"\n❓ PREGUNTAS ADICIONALES RECOMENDADAS:")
        for i, pregunta in enumerate(resultado.preguntas_adicionales, 1):
            print(f"  {i}. {pregunta}")
        
        print(f"\n📌 NOTAS RELEVANTES:")
        for i, nota in enumerate(resultado.notas_relevantes, 1):
            print(f"  {i}. {nota}")
        
        print("\n" + "="*80)
        print("✅ Prueba completada exitosamente")
        
    except Exception as e:
        print(f"\n❌ Error en la prueba: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_analysis()
