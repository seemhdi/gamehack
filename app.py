import os
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

# --- App Initialization and Configuration ---
app = Flask(__name__)
instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
os.makedirs(instance_path, exist_ok=True)

app.config['SECRET_KEY'] = 'a_super_secret_key_that_should_be_changed'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(instance_path, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login' # The route to redirect to for login_required pages
login_manager.login_message_category = 'info' # Flash message category

# --- Database Models ---
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    score = db.Column(db.Integer, default=0)
    rank = db.Column(db.String(80), default='Beginner')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class Tutorial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False) # Beginner, Intermediate, Advanced
    questions = db.relationship('Question', backref='tutorial', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Tutorial {self.title}>'

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    tutorial_id = db.Column(db.Integer, db.ForeignKey('tutorial.id'), nullable=False)
    choices = db.relationship('Choice', backref='question', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Question {self.text}>'

class Choice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    is_correct = db.Column(db.Boolean, default=False, nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)

    def __repr__(self):
        return f'<Choice {self.text}>'

# --- Routes ---

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('profile'))
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        user_by_username = User.query.filter_by(username=username).first()
        if user_by_username:
            flash('نام کاربری قبلاً استفاده شده است.', 'danger')
            return redirect(url_for('register'))

        user_by_email = User.query.filter_by(email=email).first()
        if user_by_email:
            flash('ایمیل قبلاً استفاده شده است.', 'danger')
            return redirect(url_for('register'))

        new_user = User(username=username, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        flash('ثبت‌نام با موفقیت انجام شد! لطفاً وارد شوید.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('profile'))
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            login_user(user, remember=True)
            flash('ورود با موفقیت انجام شد.', 'success')
            return redirect(url_for('profile'))
        else:
            flash('ورود ناموفق. لطفاً نام کاربری و رمز عبور را بررسی کنید.', 'danger')

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('شما با موفقیت از حساب خود خارج شدید.', 'success')
    return redirect(url_for('index'))

# --- Rank Configuration ---
RANKS = {
    'Beginner': {'min': 0, 'max': 99, 'next_rank': 'Intermediate'},
    'Intermediate': {'min': 100, 'max': 499, 'next_rank': 'Advanced'},
    'Advanced': {'min': 500, 'max': 999, 'next_rank': 'Expert'},
    'Expert': {'min': 1000, 'max': float('inf'), 'next_rank': None}
}

@app.route('/')
def index():
    # Redirect authenticated users to their profile, otherwise show a landing page or login
    if current_user.is_authenticated:
        return redirect(url_for('profile'))
    return render_template('index.html')

@app.route('/tutorials/<category>')
@login_required
def tutorials(category):
    if category not in ['Beginner', 'Intermediate', 'Advanced']:
        flash('دسته آموزشی نامعتبر است.', 'danger')
        return redirect(url_for('profile'))

    tutorial_list = Tutorial.query.filter_by(category=category).all()
    return render_template('tutorials.html', category_name=category, tutorials=tutorial_list)


@app.route('/tutorial/<int:tutorial_id>', methods=['GET', 'POST'])
@login_required
def tutorial(tutorial_id):
    tutorial = Tutorial.query.get_or_404(tutorial_id)

    if request.method == 'POST':
        # Grade the quiz
        score = 0
        total = len(tutorial.questions)

        for question in tutorial.questions:
            submitted_choice_id = request.form.get(f'question_{question.id}')
            if submitted_choice_id:
                # In a real app, you'd want to ensure the choice belongs to the question
                submitted_choice = Choice.query.get(submitted_choice_id)
                if submitted_choice and submitted_choice.is_correct:
                    score += 1

        # Award points (e.g., 10 points per correct answer)
        points_to_add = score * 10
        if points_to_add > 0:
            add_score(current_user.id, points_to_add)

        flash(f'شما به {score} از {total} سوال پاسخ صحیح دادید و {points_to_add} امتیاز کسب کردید!', 'success')
        return redirect(url_for('profile'))

    return render_template('tutorial.html', tutorial=tutorial)

@app.route('/profile')
@login_required
def profile():
    user_rank_info = RANKS.get(current_user.rank, RANKS['Beginner'])
    next_rank = user_rank_info['next_rank']

    progress_percent = 0
    if next_rank:
        min_score = user_rank_info['min']
        max_score = user_rank_info['max']
        # Avoid division by zero if a rank has a zero range for some reason
        rank_score_range = (max_score - min_score)
        if rank_score_range > 0:
            current_score_in_rank = current_user.score - min_score
            progress_percent = (current_score_in_rank / rank_score_range) * 100
            progress_percent = min(100, max(0, progress_percent)) # Clamp between 0 and 100

    return render_template(
        'profile.html',
        user=current_user,
        progress=int(progress_percent),
        next_rank=next_rank
    )

# --- Scoring and Rank-Up Logic ---
def add_score(user_id, amount):
    user = User.query.get(user_id)
    if not user:
        return

    user.score += amount

    # Check for rank up
    new_rank = None
    # Iterate through ranks to find the highest one the user qualifies for
    for rank, details in RANKS.items():
        if user.score >= details['min']:
            new_rank = rank

    if new_rank and new_rank != user.rank:
        user.rank = new_rank
        flash(f'تبریک! شما به رتبه {new_rank} ارتقا پیدا کردید!', 'success')

    db.session.commit()

# This is a temporary route for testing the scoring logic
@app.route('/add_points/<int:points>')
@login_required
def add_points(points):
    add_score(current_user.id, points)
    return redirect(url_for('profile'))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
