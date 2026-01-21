/**
 * Meal Planner - Backend Server
 * 
 * This is the Node.js/Express backend server that handles:
 * - Serving the static frontend (index.html)
 * - Storing and retrieving meal data from JSON file
 * - Admin PIN verification
 * - API endpoints for meal management
 * 
 * @version 1.0.0
 * @license MIT
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'meals.json');

// Admin PIN - can be set via environment variable for security
// Default is '1234' but should be changed in production
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

// Middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies up to 10MB
app.use(express.static(__dirname)); // Serve static files (index.html)

/**
 * Default Meals Database
 * These 20 meals are loaded into the database on first startup
 * Each meal has:
 * - name: The meal's display name
 * - steps: HTML-formatted cooking instructions (use <br> for line breaks)
 * - ingredients: Array of { name, quantity } objects
 */
const DEFAULT_MEALS = [
    {
        name: "Chicken Fried Rice",
        steps: "1. Heat 1 tablespoon of oil in a large pan on medium heat.<br>2. Add diced chicken and cook for 4–5 minutes until lightly browned.<br>3. Add minced garlic and cook for 30 seconds.<br>4. Add diced carrot and peas and cook for 2–3 minutes.<br>5. Push everything to one side of the pan and crack in the eggs.<br>6. Scramble the eggs until mostly set, then mix through the veg and chicken.<br>7. Add cooked rice and break up any clumps.<br>8. Add soy sauce and stir for 2–3 minutes until heated through.<br>9. Taste and season with salt and pepper.",
        ingredients: [
            {name: "Chicken breast", quantity: "300 g"},
            {name: "Rice (cooked)", quantity: "3 cups"},
            {name: "Carrot", quantity: "1 medium"},
            {name: "Peas", quantity: "1 cup"},
            {name: "Eggs", quantity: "2"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Soy sauce", quantity: "2 tablespoons"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Honey Soy Chicken",
        steps: "1. Heat 1 tablespoon of oil in a pan on medium heat.<br>2. Add chicken thighs and cook for 4–5 minutes on each side until browned.<br>3. Add minced garlic, honey and soy sauce to the pan.<br>4. Simmer for 2–3 minutes until the sauce thickens slightly.<br>5. Steam sliced carrot and green beans for 4–5 minutes until tender.<br>6. Serve chicken with steamed vegetables.",
        ingredients: [
            {name: "Chicken thighs", quantity: "400 g"},
            {name: "Carrot", quantity: "1 medium"},
            {name: "Green beans", quantity: "200 g"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Honey", quantity: "1 tablespoon"},
            {name: "Soy sauce", quantity: "2 tablespoons"},
            {name: "Olive oil", quantity: "As needed"}
        ]
    },
    {
        name: "Pork Schnitzel with Mash",
        steps: "1. Peel and chop potatoes into small chunks.<br>2. Boil potatoes for 12–15 minutes until soft.<br>3. Drain potatoes and mash with butter, milk, salt and pepper.<br>4. Heat oil in a pan on medium heat.<br>5. Cook schnitzels for 3–4 minutes per side until golden.<br>6. Microwave peas with a splash of water for 2 minutes.<br>7. Serve schnitzel with mash and peas.",
        ingredients: [
            {name: "Pork schnitzel", quantity: "400 g"},
            {name: "Potatoes", quantity: "3 medium"},
            {name: "Peas", quantity: "1 cup"},
            {name: "Butter", quantity: "1 tablespoon"},
            {name: "Milk", quantity: "1/4 cup"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"},
            {name: "Olive oil", quantity: "As needed"}
        ]
    },
    {
        name: "Beef Stroganoff",
        steps: "1. Boil pasta for 10–12 minutes until tender.<br>2. Heat oil in a pan on medium heat.<br>3. Add beef strips and cook for 3–4 minutes until browned.<br>4. Add sliced onion and mushrooms and cook for 3 minutes.<br>5. Add minced garlic and cook for 30 seconds.<br>6. Add beef stock and simmer for 2 minutes.<br>7. Stir in sour cream and cook for 1–2 minutes. Do not boil.<br>8. Drain pasta and mix with the sauce.<br>9. Season with salt and pepper.",
        ingredients: [
            {name: "Beef strips", quantity: "400 g"},
            {name: "Mushrooms", quantity: "1 cup sliced"},
            {name: "Onion", quantity: "1 small"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Sour cream", quantity: "1/2 cup"},
            {name: "Beef stock", quantity: "1/2 cup"},
            {name: "Pasta", quantity: "200 g"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Chicken Quesadillas",
        steps: "1. Heat oil in a pan on medium heat.<br>2. Cook diced chicken for 4–5 minutes until lightly browned.<br>3. Add minced garlic and cook for 30 seconds.<br>4. Add grated zucchini and spinach and cook for 2 minutes until softened.<br>5. Place a wrap in a clean pan on low heat.<br>6. Add cheese, chicken mixture, then more cheese, and top with another wrap.<br>7. Cook for 2 minutes per side until golden and melted.<br>8. Slice and serve.",
        ingredients: [
            {name: "Chicken breast", quantity: "300 g"},
            {name: "Zucchini", quantity: "1 medium"},
            {name: "Baby spinach", quantity: "1 cup"},
            {name: "Cheese (grated)", quantity: "1 cup"},
            {name: "Wraps", quantity: "4"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Salmon and Veg",
        steps: "1. Heat 1 teaspoon of oil in a pan on medium heat.<br>2. Add salmon skin-side down and cook for 3–4 minutes.<br>3. Flip salmon and cook for 2 minutes.<br>4. Add butter and minced garlic to the pan and let it melt.<br>5. Add sliced zucchini and green beans around the salmon.<br>6. Cook vegetables for 3–4 minutes, stirring occasionally.<br>7. Spoon garlic butter over the salmon.<br>8. Season with salt and pepper and serve.",
        ingredients: [
            {name: "Salmon fillets", quantity: "2 fillets"},
            {name: "Zucchini", quantity: "1 medium"},
            {name: "Green beans", quantity: "200 g"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Butter", quantity: "1 tablespoon"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"},
            {name: "Lemon wedge", quantity: "Optional"}
        ]
    },
    {
        name: "Pork San Choy Bow",
        steps: "1. Rinse rice and add to a pot with 2 cups of water and a pinch of salt.<br>2. Bring to a boil, then reduce heat to low, cover and cook for 12 minutes.<br>3. Heat oil in a pan on medium heat.<br>4. Add pork mince and cook for 4–5 minutes until browned.<br>5. Add minced garlic and cook for 30 seconds.<br>6. Add grated carrot and grated zucchini and cook for 2–3 minutes.<br>7. Add soy sauce and honey and stir for 1–2 minutes.<br>8. Fluff rice and serve pork mixture on top.",
        ingredients: [
            {name: "Pork mince", quantity: "500 g"},
            {name: "Carrot", quantity: "1 medium"},
            {name: "Zucchini", quantity: "1 medium"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Soy sauce", quantity: "2 tablespoons"},
            {name: "Honey", quantity: "1 tablespoon"},
            {name: "Rice (uncooked)", quantity: "1 cup"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Chicken & Mushroom Risotto",
        steps: "1. Heat 1 tablespoon of oil in a pan on medium heat.<br>2. Add diced chicken and cook for 4–5 minutes until lightly browned.<br>3. Add sliced mushrooms and cook for 2 minutes.<br>4. Add minced garlic and cook for 30 seconds.<br>5. Add rice and stir for 1 minute to coat.<br>6. Add 1 cup of stock and stir until mostly absorbed.<br>7. Add remaining stock 1 cup at a time, stirring occasionally.<br>8. Cook for 15–18 minutes until rice is tender.<br>9. Stir in parmesan and season with salt and pepper.",
        ingredients: [
            {name: "Chicken breast", quantity: "300 g"},
            {name: "Mushrooms", quantity: "1 cup sliced"},
            {name: "Arborio rice", quantity: "1 cup"},
            {name: "Chicken stock", quantity: "4 cups"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Parmesan", quantity: "1/2 cup"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Beef Stir-Fry",
        steps: "1. If serving with rice, cook 1 cup rice with 2 cups water for 12 minutes.<br>2. Heat oil in a large pan or wok on medium-high heat.<br>3. Add beef strips and cook for 3–4 minutes until browned.<br>4. Add sliced zucchini, sliced carrot and snow peas.<br>5. Stir-fry for 3–4 minutes until vegetables soften slightly.<br>6. Add minced garlic, soy sauce and honey.<br>7. Cook for 1–2 minutes until coated and glossy.<br>8. Serve immediately, with rice if desired.",
        ingredients: [
            {name: "Beef strips", quantity: "400 g"},
            {name: "Zucchini", quantity: "1 medium"},
            {name: "Carrot", quantity: "1 medium"},
            {name: "Snow peas", quantity: "1 cup"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Soy sauce", quantity: "2 tablespoons"},
            {name: "Honey", quantity: "1 tablespoon"},
            {name: "Rice (uncooked)", quantity: "1 cup"},
            {name: "Olive oil", quantity: "As needed"}
        ]
    },
    {
        name: "Chicken Pesto Pasta",
        steps: "1. Boil pasta for 10–12 minutes until tender.<br>2. Heat 1 tablespoon of oil in a pan on medium heat.<br>3. Add diced chicken and cook for 4–5 minutes until lightly browned.<br>4. Add minced garlic and cook for 30 seconds.<br>5. Add spinach and stir until wilted.<br>6. Drain pasta and add it to the pan.<br>7. Add pesto and stir for 1–2 minutes until coated.<br>8. Season with salt and pepper.",
        ingredients: [
            {name: "Chicken breast", quantity: "300 g"},
            {name: "Pasta", quantity: "200 g"},
            {name: "Baby spinach", quantity: "2 cups"},
            {name: "Pesto", quantity: "1/4 cup"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Pork Sausage Pasta",
        steps: "1. Boil pasta for 10–12 minutes until tender.<br>2. Heat 1 tablespoon of oil in a pan on medium heat.<br>3. Remove sausage meat from casings and add to the pan.<br>4. Cook for 4–5 minutes, breaking it up as it browns.<br>5. Add minced garlic and cook for 30 seconds.<br>6. Add grated zucchini and cook for 2 minutes.<br>7. Add passata and simmer for 5 minutes.<br>8. Drain pasta and mix into the sauce.<br>9. Season with salt, pepper and herbs if using.",
        ingredients: [
            {name: "Pork sausages", quantity: "4"},
            {name: "Pasta", quantity: "200 g"},
            {name: "Zucchini", quantity: "1 medium"},
            {name: "Passata", quantity: "1 cup"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Lemon Garlic Chicken",
        steps: "1. Rinse rice and add to a pot with 2 cups of water and a pinch of salt.<br>2. Bring to a boil, then reduce heat to low, cover and cook for 12 minutes.<br>3. Heat 1 tablespoon of oil in a pan on medium heat.<br>4. Add diced chicken and cook for 4–5 minutes until lightly browned.<br>5. Add minced garlic and cook for 30 seconds.<br>6. Add sliced zucchini and cook for 2–3 minutes.<br>7. Add butter and the juice of half a lemon.<br>8. Cook for 1–2 minutes until the sauce thickens slightly.<br>9. Fluff rice and serve chicken mixture on top.",
        ingredients: [
            {name: "Chicken breast", quantity: "300 g"},
            {name: "Zucchini", quantity: "1 medium"},
            {name: "Rice (uncooked)", quantity: "1 cup"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Lemon", quantity: "1/2"},
            {name: "Butter", quantity: "1 tablespoon"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Chicken Teriyaki Stir-Fry",
        steps: "1. Rinse rice and cook with 2 cups of water for 12 minutes.<br>2. Heat oil in a large pan on medium-high heat.<br>3. Add diced chicken and cook for 4–5 minutes until browned.<br>4. Add sliced carrot, sliced zucchini and green beans.<br>5. Stir-fry for 3–4 minutes until vegetables soften slightly.<br>6. Add teriyaki sauce and cook for 1–2 minutes.<br>7. Serve over rice.",
        ingredients: [
            {name: "Chicken breast", quantity: "300 g"},
            {name: "Carrot", quantity: "1 medium"},
            {name: "Zucchini", quantity: "1 medium"},
            {name: "Green beans", quantity: "200 g"},
            {name: "Teriyaki sauce", quantity: "1/4 cup"},
            {name: "Rice (uncooked)", quantity: "1 cup"},
            {name: "Olive oil", quantity: "As needed"}
        ]
    },
    {
        name: "Beef & Potato Hash",
        steps: "1. Peel and dice potatoes into small cubes.<br>2. Heat oil in a pan on medium heat.<br>3. Add potatoes and cook for 8–10 minutes until softened and lightly browned.<br>4. Add beef mince and cook for 4–5 minutes until browned.<br>5. Add minced garlic and cook for 30 seconds.<br>6. Add spinach and stir until wilted.<br>7. Season with salt, pepper and herbs if using.",
        ingredients: [
            {name: "Beef mince", quantity: "400 g"},
            {name: "Potatoes", quantity: "3 medium"},
            {name: "Baby spinach", quantity: "2 cups"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Mushroom Omelette",
        steps: "1. Heat butter or oil in a pan on medium heat.<br>2. Add sliced mushrooms and cook for 2–3 minutes until softened.<br>3. Add spinach and cook for 1 minute until wilted.<br>4. In a bowl, whisk eggs with salt and pepper.<br>5. Pour eggs into the pan and tilt to spread evenly.<br>6. Cook on low heat for 3–4 minutes until the edges begin to set.<br>7. Sprinkle cheese over the top.<br>8. Fold the omelette gently and cook for 1 more minute.<br>9. Serve immediately.",
        ingredients: [
            {name: "Eggs", quantity: "3"},
            {name: "Mushrooms", quantity: "1/2 cup sliced"},
            {name: "Baby spinach", quantity: "1 cup"},
            {name: "Cheese (grated)", quantity: "1/4 cup"},
            {name: "Butter", quantity: "1 tablespoon"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Creamy Chicken Pasta",
        steps: "1. Fill a large pot with water, add 1 teaspoon of salt, and bring it to a boil.<br>2. Add the pasta and cook for 10–12 minutes until soft enough to bite through, stirring occasionally.<br>3. Heat 1 tablespoon of olive oil in a pan on medium heat.<br>4. Add the sliced chicken and cook for 4–5 minutes until the outside is white and lightly browned.<br>5. Add the minced garlic and sliced mushrooms and cook for 2 minutes.<br>6. Pour in the cream and let it gently bubble for 2–3 minutes.<br>7. Add the grated parmesan and stir until the sauce thickens. If it becomes too thick, add 2 tablespoons of water.<br>8. Add the spinach and stir until wilted.<br>9. Drain the pasta and add it to the pan, mixing well.<br>10. Taste and season with salt and pepper before serving.",
        ingredients: [
            {name: "Chicken breast", quantity: "300 g"},
            {name: "Pasta", quantity: "200 g"},
            {name: "Mushrooms", quantity: "1 cup sliced"},
            {name: "Heavy cream", quantity: "1 cup"},
            {name: "Parmesan", quantity: "1/2 cup"},
            {name: "Baby spinach", quantity: "2 cups"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Beef and Veg Bolognese",
        steps: "1. Fill a pot with water, add 1 teaspoon of salt, and bring to a boil.<br>2. Add pasta and cook for 10–12 minutes, stirring occasionally.<br>3. Heat 1 tablespoon of olive oil in a pan on medium heat.<br>4. Add the beef mince and cook for 4–5 minutes until no pink remains.<br>5. Add grated zucchini and grated carrot and cook for 3 minutes.<br>6. Add minced garlic and cook for 30 seconds.<br>7. Add passata, tomato paste, herbs, salt and pepper, and stir well.<br>8. Simmer for 10 minutes. If the sauce becomes too thick, add 2 tablespoons of water.<br>9. Drain pasta and mix it into the sauce.<br>10. Taste and adjust seasoning before serving.",
        ingredients: [
            {name: "Beef mince", quantity: "400 g"},
            {name: "Pasta", quantity: "200 g"},
            {name: "Zucchini", quantity: "1 medium"},
            {name: "Carrot", quantity: "1 medium"},
            {name: "Passata", quantity: "1 cup"},
            {name: "Tomato paste", quantity: "2 tablespoons"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    },
    {
        name: "Salmon Rice Bowls",
        steps: "1. Rinse 1 cup of rice under cold water until the water runs mostly clear.<br>2. Add rice and 2 cups of water to a pot with a pinch of salt.<br>3. Bring to a boil on high heat, then reduce to low and cover with a lid.<br>4. Cook for 12 minutes without lifting the lid.<br>5. Turn off heat and let the rice rest for 5 minutes, then fluff with a fork.<br>6. Steam green beans and carrot ribbons for 3–5 minutes until tender.<br>7. Heat a pan with a small amount of oil on medium heat.<br>8. Place salmon skin‑side down and cook for 3–4 minutes.<br>9. Flip salmon and cook for 2 minutes.<br>10. Add teriyaki sauce to the pan and let it bubble for 30 seconds to glaze.<br>11. Serve salmon and vegetables over the rice.",
        ingredients: [
            {name: "Salmon fillets", quantity: "2 fillets"},
            {name: "Rice (uncooked)", quantity: "1 cup"},
            {name: "Green beans", quantity: "200 g"},
            {name: "Carrot", quantity: "1 medium"},
            {name: "Teriyaki sauce", quantity: "2 tablespoons"},
            {name: "Olive oil", quantity: "As needed"},
            {name: "Salt", quantity: "To taste"}
        ]
    },
    {
        name: "Pork and Veg Stir-Fry",
        steps: "1. Heat 1 tablespoon of olive oil in a large pan or wok on medium‑high heat.<br>2. Add pork strips and cook for 2–3 minutes until lightly browned.<br>3. Add sliced zucchini, sliced carrot and snow peas.<br>4. Stir‑fry for 3–4 minutes until vegetables soften slightly.<br>5. Add minced garlic, soy sauce and honey (or teriyaki).<br>6. Stir for 1–2 minutes until everything is coated.<br>7. If the sauce becomes too thick, add 1 tablespoon of water.<br>8. Serve immediately, with rice or wraps if desired.",
        ingredients: [
            {name: "Pork strips", quantity: "400 g"},
            {name: "Zucchini", quantity: "1 medium"},
            {name: "Carrot", quantity: "1 medium"},
            {name: "Snow peas", quantity: "1 cup"},
            {name: "Garlic", quantity: "1 clove"},
            {name: "Soy sauce", quantity: "2 tablespoons"},
            {name: "Honey", quantity: "1 tablespoon"},
            {name: "Olive oil", quantity: "As needed"}
        ]
    },
    {
        name: "Bacon and Zucchini Frittata",
        steps: "1. Heat a pan on medium heat and cook chopped bacon for 3–4 minutes until lightly crisp.<br>2. Add sliced mushrooms and cook for 2 minutes.<br>3. Add zucchini and cook for another 2 minutes.<br>4. Add spinach and stir until wilted.<br>5. Whisk eggs with salt and pepper in a bowl.<br>6. Pour eggs into the pan and tilt to spread evenly.<br>7. Cook on low heat for 3–4 minutes until the edges begin to set.<br>8. Turn on your oven's electric grill now and let it heat for 2 minutes.<br>9. Place the pan under the grill for 2–4 minutes until the top is firm and lightly golden.<br>10. Remove from heat, rest for 2 minutes, slice and serve.",
        ingredients: [
            {name: "Bacon", quantity: "4 slices"},
            {name: "Eggs", quantity: "6"},
            {name: "Zucchini", quantity: "1 medium"},
            {name: "Mushrooms", quantity: "1/2 cup sliced"},
            {name: "Baby spinach", quantity: "1 cup"},
            {name: "Salt", quantity: "To taste"},
            {name: "Pepper", quantity: "To taste"}
        ]
    }
];

/**
 * Initialize the data file with default meals if it doesn't exist
 * This runs once on server startup to ensure we have a meals.json file
 */
async function initDataFile() {
    try {
        // Check if data file already exists
        await fs.access(DATA_FILE);
        console.log('Data file already exists');
    } catch {
        // File doesn't exist, create it with default meals
        const defaultData = {
            meals: DEFAULT_MEALS,
            weekPlan: {}
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
        console.log('Created new data file with 20 default meals');
    }
}

/**
 * API Endpoints
 */

/**
 * GET /api/data
 * Returns all meals and the current week plan
 * This is publicly accessible (no authentication required)
 */
app.get('/api/data', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

/**
 * POST /api/admin/verify
 * Verifies the admin PIN for accessing protected features
 * Request body: { pin: "1234" }
 * Returns: { success: true } or { success: false, error: "Invalid PIN" }
 */
app.post('/api/admin/verify', async (req, res) => {
    try {
        const { pin } = req.body;
        if (pin === ADMIN_PIN) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, error: 'Invalid PIN' });
        }
    } catch (error) {
        console.error('Error verifying PIN:', error);
        res.status(500).json({ error: 'Failed to verify PIN' });
    }
});

/**
 * POST /api/data
 * Saves meal data and week plan to the JSON file
 * Note: In production, this should verify admin PIN before saving
 * Request body: { meals: [], weekPlan: {} }
 */
app.post('/api/data', async (req, res) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

/**
 * Start the Express server
 * First initializes the data file, then starts listening on the configured port
 */
initDataFile().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Meal Planner running on http://0.0.0.0:${PORT}`);
        console.log(`Data stored in: ${DATA_FILE}`);
        console.log(`Admin PIN: ${ADMIN_PIN === '1234' ? '⚠️  Using default PIN - change this in production!' : '✓ Custom PIN set'}`);
    });
});