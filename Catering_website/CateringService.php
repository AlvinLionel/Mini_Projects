<?php
$feedback = "";
$error = "";
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $message = trim($_POST["message"] ?? "");

    if ($name === "" || $email === "" || $message === "") {
        $error = "Please fill in all fields before submitting.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Please enter a valid email address.";
    } else {
        $feedback = "Thank you, " . htmlspecialchars($name) . ". Your message has been received. We will contact you at " . htmlspecialchars($email) . " soon.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fresh Feast Catering</title>
    <style>
        :root {
            --primary: #d95d39;
            --secondary: #1f3a3a;
            --light: #f7f1ea;
            --accent: #f2c57c;
            --shadow: rgba(31, 58, 58, 0.18);
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            background: linear-gradient(180deg, #fffaf3 0%, #f1f0eb 100%);
            color: #2b2b2b;
            line-height: 1.6;
        }

        header {
            background: var(--secondary);
            color: white;
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 3px 10px var(--shadow);
        }

        .container {
            width: min(1100px, 100% - 2rem);
            margin: 0 auto;
        }

        .top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 0;
        }

        .brand {
            font-size: 1.5rem;
            letter-spacing: 1px;
            font-weight: 700;
        }

        nav {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        nav a {
            color: white;
            text-decoration: none;
            transition: color 0.2s ease;
        }

        nav a:hover,
        nav a.active {
            color: var(--accent);
            text-decoration: underline;
            transform: scale(1.2);
        }

        .hero {
            min-height: 70vh;
            display: grid;
            place-items: center;
            text-align: center;
            padding: 3rem 0 4rem;
        }

        .hero h1 {
            margin: 0;
            font-size: clamp(2.5rem, 5vw, 4rem);
        }

        .hero p {
            max-width: 720px;
            margin: 1.5rem auto 0;
            color: #4a4a4a;
            font-size: 1.05rem;
        }

        .grid {
            display: grid;
            gap: 1.5rem;
        }

        .card {
            background: white;
            border-radius: 20px;
            padding: 1.8rem;
            box-shadow: 0 10px 25px var(--shadow);
        }
        .card:hover{
            transform: scale(1.2);
            transition-duration: 2s;
            box-shadow: 0 10px 25px var(--accent);
        }

        .section-title {
            margin-bottom: 1rem;
            font-size: 2rem;
            color: var(--secondary);
        }

        .services,
        .menu,
        .reviews {
            margin-bottom: 3rem;
        }

        .service-list {
            display: grid;
            gap: 1rem;
        }

        .service-item {
            padding: 1rem;
            border-left: 5px solid var(--primary);
            background: #fff6ef;
            border-radius: 12px;
        }

        .menu-grid,
        .review-grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        }

        .dish-card {
            border-radius: 18px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .dish-photo {
            width: 100%;
            aspect-ratio: 4 / 3;
            object-fit: cover;
        }

        .dish-content {
            padding: 1rem;
            background: white;
            flex: 1;
        }

        .dish-title {
            margin: 0 0 0.5rem;
            font-size: 1.2rem;
        }

        .dish-text {
            margin: 0;
            color: #575757;
        }

        .review {
            padding: 1.2rem;
            background: #fff;
            border-radius: 18px;
            border: 1px solid rgba(223, 210, 192, 0.8);
        }

        .review strong {
            display: block;
            margin-bottom: 0.75rem;
            color: var(--primary);
        }

        .contact {
            margin-bottom: 4rem;
        }

        .contact-grid {
            grid-template-columns: 1.1fr 0.9fr;
            align-items: start;
            gap: 2rem;
        }

        form {
            display: grid;
            gap: 1rem;
        }

        label {
            font-weight: 600;
        }

        input,
        textarea {
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 12px;
            padding: 0.95rem 1rem;
            font: inherit;
            resize: vertical;
        }

        button {
            border: none;
            padding: 1rem 1.4rem;
            border-radius: 999px;
            background: var(--primary);
            color: white;
            cursor: pointer;
            font-weight: 700;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(217, 93, 57, 0.3);
        }

        .message-box {
            padding: 1rem 1.2rem;
            border-radius: 14px;
            background: #eefaf3;
            border: 1px solid #cde7d4;
            color: #1b4534;
        }

        .error-box {
            background: #fdecea;
            border-color: #f5c6cb;
            color: #8a1f1f;
        }

        .footer {
            text-align: center;
            padding: 2rem 0 1rem;
            color: #6f6f6f;
        }

        @media (max-width: 840px) {
            .contact-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 650px) {
            .top-bar {
                flex-direction: column;
                gap: 0.75rem;
            }

            nav {
                justify-content: center;
            }
        }
    </style>
</head>

<body>
    <header>
        <div class="container">
            <div class="top-bar">
                <div class="brand">Fresh Feast Catering</div>
                <nav>
                    <a href="#home" class="active">Home</a>
                    <a href="#services">Services</a>
                    <a href="#menu">Menu</a>
                    <a href="#reviews">Reviews</a>
                    <a href="#contact">Contact</a>
                </nav>
            </div>
        </div>
    </header>

    <main class="container">
        <section id="home" class="hero">
            <div>
                <h1>Delicious catering for every event</h1>
                <p>From corporate meetings to intimate family celebrations, Fresh Feast Catering delivers full-service
                    menus, expert planning support, and unforgettable meals made from fresh ingredients.</p>
            </div>
        </section>

        <section id="services" class="services">
            <div class="section-title">Our Services</div>
            <div class="service-list">
                <div class="service-item">
                    <h3>Custom Event Menus</h3>
                    <p>Build the perfect menu with appetizers, mains, desserts, and drink pairings designed for your
                        event.</p>
                </div>
                <div class="service-item">
                    <h3>Full-Service Catering</h3>
                    <p>Enjoy the event while our team handles setup, service, and cleanup with professional attention.
                    </p>
                </div>
                <div class="service-item">
                    <h3>Delivery & Pickup</h3>
                    <p>Choose fast delivery or pickup options to enable us to serve you best.</p>
                </div>
                <div class="service-item">
                    <h3>All Dietary Options</h3>
                    <p>Food that include everyone: vegetarian, vegan, and allergy-friendly options. Drinks are also provided based on your desires, from alcoholic to child-friendly.</p>
                </div>
            </div>
        </section>

        <section id="menu" class="menu">
            <div class="section-title">Featured Dishes</div>
            <div class="grid menu-grid">
                <article class="card dish-card">
                    <img class="dish-photo"
                        src="https://plus.unsplash.com/premium_photo-1668031802460-89952ecb00f7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXBwZXRpemVyfGVufDB8fDB8fHww"
                        alt="Bitesize appetizers">
                    <div class="dish-content">
                        <h4 class="dish-title">Appetizers</h4>
                        <p class="dish-text">Entice your taste buds with our wide selection of starters while you wait
                            on the main course.</p>
                    </div>
                </article>
                <article class="card dish-card">
                    <img class="dish-photo"
                        src="https://plus.unsplash.com/premium_photo-1663840345377-3813d196d5da?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bWFpbiUyMGNvdXJzZXxlbnwwfHwwfHx8MA%3D%3D"
                        alt="Main course dish">
                    <div class="dish-content">
                        <h4 class="dish-title">Main course</h4>
                        <p class="dish-text">Experience our delicious main courses, prepared to satistify both your
                            hunger and taste buds.</p>
                    </div>
                </article>
                <article class="card dish-card">
                    <img class="dish-photo"
                        src="https://plus.unsplash.com/premium_photo-1680172800885-61c5f1fc188e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZGVzc2VydHxlbnwwfHwwfHx8MA%3D%3D"
                        alt="Dessert">
                    <div class="dish-content">
                        <h4 class="dish-title">Dessert</h4>
                        <p class="dish-text">What better way to conclude your meal that with finely prepared desserts to
                            satisy your sweet tooth</p>
                    </div>
                </article>
                <article class="card dish-card">
                    <img class="dish-photo"
                        src="https://plus.unsplash.com/premium_photo-1684952849219-5a0d76012ed2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZHJpbmtzfGVufDB8fDB8fHww"
                        alt="Drinks">
                    <div class="dish-content">
                        <h4 class="dish-title">Drinks</h4>
                        <p class="dish-text">Drinks to quench your thirst and complement your meal. From alcoholic to child-friendly.</p>
                    </div>
                </article>
            </div>
        </section>

        <section id="reviews" class="reviews">
            <div class="section-title">Customer Reviews</div>
            <div class="grid review-grid">
                <div class="card review">
                    <strong>Alvin L.</strong>
                    <p>"Fresh Feast made our celebration dinner flawless. The food was amazing and the staff was
                        very friendly. Highly recommend"</p>
                </div>
                <div class="card review">
                    <strong>Ryan T.</strong>
                    <p>"Took care of everything from planning to cleanup after the event. Recommended!"</p>
                </div>
                <div class="card review">
                    <strong>Sam N.</strong>
                    <p>"They had dishes for everyone and met every need that we had. Will definitely use their services
                        again😎"</p>
                </div>
            </div>
        </section>

        <section id="contact" class="contact">
            <div class="section-title">Contact Us</div>
            <div class="contact-grid">
                <div class="card">
                    <h3>Ready to book your event?</h3>
                    <p>reach out to us below and our team will reach out to confirm availability and
                        get your needs.</p>
                    <ul>
                        <li><strong>Email:</strong> example@gmail.com</li>
                        <li><strong>Phone:</strong> 123456789</li>
                        <li><strong>Location:</strong> example location</li>
                    </ul>
                </div>
                <form action="#contact" method="post" id="contactForm">
                    <?php if ($error): ?>
                        <div class="message-box error-box"><?= htmlspecialchars($error) ?></div>
                    <?php elseif ($feedback): ?>
                        <div class="message-box"><?= htmlspecialchars($feedback) ?></div>
                    <?php endif; ?>
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" placeholder="Your full name"
                        value="<?= isset($name) ? htmlspecialchars($name) : '' ?>" required />

                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="you@example.com"
                        value="<?= isset($email) ? htmlspecialchars($email) : '' ?>" required />

                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="5" placeholder="Send us a message or ask a question"
                        required>
                        <?= isset($message) ? htmlspecialchars($message) : '' ?>
                    </textarea>
                    <button type="submit">Send Request</button>
                </form>
            </div>
        </section>
    </main>

    <footer class="footer">
        <p>Fresh Feast Catering © 2026. Serving memorable meals for every celebration.</p>
    </footer>
    <script>
        const navLinks = document.querySelectorAll('nav a');
        const sections = document.querySelectorAll('section');

        function updateActiveLink() {
            const scrollPos = window.scrollY + 120;
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;
                const id = section.id;
                const link = document.querySelector(`nav a[href='#${id}']`);
                if (scrollPos >= top && scrollPos < bottom) {
                    navLinks.forEach(a => a.classList.remove('active'));
                    if (link) link.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink();

        document.getElementById('contactForm').addEventListener('submit', function (event) {
            const emailField = document.getElementById('email');
            const nameField = document.getElementById('name');
            const messageField = document.getElementById('message');
            if (!emailField.value || !nameField.value || !messageField.value) {
                alert('Please complete all fields before sending your request.');
                event.preventDefault();
            }
        });
    </script>

</body>

</html>