def is_resume_related(question):
    question = question.lower().strip()

    resume_keywords = [
        "my resume",
        "my cv",
        "my skills",
        "my experience",
        "my education",
        "my projects",
        "my achievements",
        "my certifications",
        "my qualification",
        "my background",
        "my work",
        "my profile",
        "my internship",
        "my degree",
        "my college",
        "my university",
        "my technical skills",
        "my programming skills",
        "my strengths",
        "my weaknesses",
        "do i have",
        "have i worked",
        "have i used",
        "what skills do i have",
        "what projects do i have",
        "what experience do i have",
    ]

    return any(
        keyword in question
        for keyword in resume_keywords
    )