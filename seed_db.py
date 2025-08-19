from app import app, db, Tutorial, Question, Choice

def seed_database():
    with app.app_context():
        print("Seeding database...")
        # Create Tutorial 1: Beginner
        t1 = Tutorial(
            title="آشنایی با مفاهیم وب",
            category="Beginner",
            content="""
            <h4>مقدمه</h4>
            <p>وب (World Wide Web) سیستمی از اسناد و منابع به هم پیوسته است که با استفاده از اینترنت قابل دسترسی هستند. در این آموزش، با اجزای اصلی سازنده وب آشنا می‌شویم.</p>
            <h4>HTTP چیست؟</h4>
            <p>پروتکل انتقال ابرمتن (HTTP) پایه و اساس ارتباط داده‌ها در وب است. این پروتکل مشخص می‌کند که پیام‌ها چگونه بین کلاینت (مرورگر شما) و سرور (جایی که سایت میزبانی می‌شود) قالب‌بندی و منتقل شوند.</p>
            <h4>HTML, CSS, JS</h4>
            <p>این سه، زبان‌های اصلی ساخت صفحات وب هستند:</p>
            <ul>
                <li><strong>HTML:</strong> زبان نشانه‌گذاری ابرمتن، ساختار و اسکلت یک صفحه را مشخص می‌کند.</li>
                <li><strong>CSS:</strong> برگه‌های آبشاری سبک‌دهی، ظاهر و استایل صفحه (رنگ‌ها، فونت‌ها) را کنترل می‌کند.</li>
                <li><strong>JavaScript:</strong> یک زبان برنامه‌نویسی که به صفحات وب تعامل و پویایی می‌بخشد.</li>
            </ul>
            """
        )
        db.session.add(t1)

        q1 = Question(text="کدام پروتکل، پروتکل اصلی ارتباط در وب است؟", tutorial=t1)
        db.session.add(q1)
        db.session.add_all([
            Choice(text="FTP", is_correct=False, question=q1),
            Choice(text="HTTP", is_correct=True, question=q1),
            Choice(text="SSH", is_correct=False, question=q1),
            Choice(text="SMTP", is_correct=False, question=q1)
        ])

        q2 = Question(text="کدام زبان برای تعیین ساختار و اسکلت یک صفحه وب استفاده می‌شود؟", tutorial=t1)
        db.session.add(q2)
        db.session.add_all([
            Choice(text="JavaScript", is_correct=False, question=q2),
            Choice(text="CSS", is_correct=False, question=q2),
            Choice(text="Python", is_correct=False, question=q2),
            Choice(text="HTML", is_correct=True, question=q2)
        ])

        # Create Tutorial 2: Intermediate
        t2 = Tutorial(
            title="مقدمه‌ای بر SQL Injection",
            category="Intermediate",
            content="<p>این آموزش به زودی اضافه خواهد شد...</p>"
        )
        db.session.add(t2)

        # Create Tutorial 3: Advanced
        t3 = Tutorial(
            title="تحلیل بدافزار (Malware Analysis)",
            category="Advanced",
            content="<p>این آموزش به زودی اضافه خواهد شد...</p>"
        )
        db.session.add(t3)

        db.session.commit()
        print("Database seeded with initial tutorials.")

if __name__ == '__main__':
    seed_database()
