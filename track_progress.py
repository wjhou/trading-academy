#!/usr/bin/env python3
"""Progress tracker for Trading Academy."""

import json
from pathlib import Path
from datetime import datetime

PROGRESS_FILE = Path("progress.json")

# Course structure
MODULES = {
    "module-01": {
        "name": "Trading Fundamentals",
        "lessons": 5,
        "exercises": 5,
        "estimated_hours": 10,
    },
    "module-02": {
        "name": "Technical Analysis Basics",
        "lessons": 5,
        "exercises": 5,
        "estimated_hours": 12,
    },
    "module-03": {
        "name": "Technical Indicators",
        "lessons": 5,
        "exercises": 5,
        "estimated_hours": 12,
    },
    "module-04": {
        "name": "Trading Strategies",
        "lessons": 6,
        "exercises": 6,
        "estimated_hours": 18,
    },
    "module-05": {
        "name": "Risk Management",
        "lessons": 6,
        "exercises": 6,
        "estimated_hours": 12,
    },
    "module-06": {
        "name": "Backtesting & Optimization",
        "lessons": 6,
        "exercises": 6,
        "estimated_hours": 15,
    },
    "module-07": {
        "name": "Automated Trading Systems",
        "lessons": 6,
        "exercises": 6,
        "estimated_hours": 15,
    },
    "module-08": {
        "name": "Advanced Topics",
        "lessons": 6,
        "exercises": 6,
        "estimated_hours": 18,
    },
}


def load_progress():
    """Load progress from file."""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {
        "started": datetime.now().isoformat(),
        "completed_lessons": [],
        "completed_exercises": [],
        "completed_projects": [],
        "notes": {},
    }


def save_progress(progress):
    """Save progress to file."""
    with open(PROGRESS_FILE, "w") as f:
        json.dump(progress, f, indent=2)


def mark_lesson_complete(module, lesson):
    """Mark a lesson as complete."""
    progress = load_progress()
    lesson_id = f"{module}-lesson-{lesson}"
    if lesson_id not in progress["completed_lessons"]:
        progress["completed_lessons"].append(lesson_id)
        progress["notes"][lesson_id] = {
            "completed_at": datetime.now().isoformat()
        }
        save_progress(progress)
        print(f"✓ Marked {lesson_id} as complete!")
    else:
        print(f"Already completed: {lesson_id}")


def mark_exercise_complete(module, exercise):
    """Mark an exercise as complete."""
    progress = load_progress()
    exercise_id = f"{module}-exercise-{exercise}"
    if exercise_id not in progress["completed_exercises"]:
        progress["completed_exercises"].append(exercise_id)
        progress["notes"][exercise_id] = {
            "completed_at": datetime.now().isoformat()
        }
        save_progress(progress)
        print(f"✓ Marked {exercise_id} as complete!")
    else:
        print(f"Already completed: {exercise_id}")


def show_progress():
    """Display current progress."""
    progress = load_progress()

    print("\n" + "=" * 60)
    print("📊 TRADING ACADEMY PROGRESS")
    print("=" * 60)

    total_lessons = sum(m["lessons"] for m in MODULES.values())
    total_exercises = sum(m["exercises"] for m in MODULES.values())
    total_hours = sum(m["estimated_hours"] for m in MODULES.values())

    completed_lessons = len(progress["completed_lessons"])
    completed_exercises = len(progress["completed_exercises"])

    print(f"\n📚 Lessons: {completed_lessons}/{total_lessons} " +
          f"({completed_lessons/total_lessons*100:.1f}%)")
    print(f"✏️  Exercises: {completed_exercises}/{total_exercises} " +
          f"({completed_exercises/total_exercises*100:.1f}%)")
    print(f"⏱️  Estimated time remaining: " +
          f"{total_hours * (1 - completed_lessons/total_lessons):.1f} hours")

    print("\n" + "-" * 60)
    print("MODULE BREAKDOWN")
    print("-" * 60)

    for module_id, module_info in MODULES.items():
        module_lessons = [l for l in progress["completed_lessons"]
                         if l.startswith(module_id)]
        module_exercises = [e for e in progress["completed_exercises"]
                           if e.startswith(module_id)]

        lesson_pct = len(module_lessons) / module_info["lessons"] * 100
        exercise_pct = len(module_exercises) / module_info["exercises"] * 100

        status = "✓" if lesson_pct == 100 and exercise_pct == 100 else "○"

        print(f"\n{status} {module_info['name']}")
        print(f"   Lessons: {len(module_lessons)}/{module_info['lessons']} " +
              f"({lesson_pct:.0f}%)")
        print(f"   Exercises: {len(module_exercises)}/{module_info['exercises']} " +
              f"({exercise_pct:.0f}%)")

    # Certificates earned
    print("\n" + "-" * 60)
    print("🎓 CERTIFICATES")
    print("-" * 60)

    certs = []
    if completed_lessons >= 10:  # Modules 1-2
        certs.append("✓ Trading Fundamentals Certificate")
    if completed_lessons >= 20:  # Modules 3-4
        certs.append("✓ Technical Analysis Certificate")
    if completed_lessons >= 26:  # Module 5
        certs.append("✓ Risk Management Certificate")
    if completed_lessons >= 38:  # Modules 6-7
        certs.append("✓ Automated Trading Certificate")
    if completed_lessons == total_lessons:
        certs.append("✓ Professional Trader Certificate")

    if certs:
        for cert in certs:
            print(cert)
    else:
        print("Complete lessons to earn certificates!")

    print("\n" + "=" * 60)
    print(f"Started: {progress['started'][:10]}")
    print("=" * 60 + "\n")


def main():
    """Main CLI."""
    import sys

    if len(sys.argv) == 1:
        show_progress()
    elif sys.argv[1] == "lesson":
        if len(sys.argv) != 4:
            print("Usage: python track_progress.py lesson <module> <lesson>")
            print("Example: python track_progress.py lesson module-01 1")
            sys.exit(1)
        mark_lesson_complete(sys.argv[2], sys.argv[3])
        show_progress()
    elif sys.argv[1] == "exercise":
        if len(sys.argv) != 4:
            print("Usage: python track_progress.py exercise <module> <exercise>")
            print("Example: python track_progress.py exercise module-01 1")
            sys.exit(1)
        mark_exercise_complete(sys.argv[2], sys.argv[3])
        show_progress()
    else:
        print("Unknown command. Use: lesson, exercise, or no args to show progress")


if __name__ == "__main__":
    main()
