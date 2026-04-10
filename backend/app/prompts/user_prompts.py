USER_PROMPT_MEDICAL_ANALYSIS = """Analiza la siguiente transcripción de una consulta médica y ten en cuenta el contexto del paciente si lo hubiese.
    Proporciona un análisis estructurado que ayude al médico a:
    1. Generar un resumen breve e informativo de la consulta
    2. Identificar todos los síntomas mencionados por el paciente
    3. Sugerir síntomas adicionales a investigar (tipo: "symptom")
    4. Sugerir posibles condiciones médicas a considerar (tipo: "condition")
    5. Recomendar exámenes, pruebas o acciones (tipo: "recommendation")

    Sé claro, conciso y profesional. Proporciona justificaciones sólidas para cada sugerencia.

    TRANSCRIPCIÓN:
    {transcription}

    CONTEXTO DEL PACIENTE:
    {context_section}

    """

USER_RAG_PROMPT ="""
    Extrae información que pueda ser relevante para entender mejor el caso del paciente y relacionarlo con la consulta actual.
    Información a destacar podrían ser:
    - Alergias del paciente
    - Enfermedades crónicas o condiciones médicas relevantes
    - Antecedentes destacados que puedan aportar contexto (ej. cirugías, cancer, ictus, secuelas de alguna enfermedad, etc.)
    - Medicamentos que el paciente esté tomando actualmente o haya tomado recientemente
    No incluyas otra información que no aporte valor al análisis actual.
    """