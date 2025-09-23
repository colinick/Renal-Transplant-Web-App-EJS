import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine: EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static assets (CSS, images, client JS)
app.use(express.static(path.join(__dirname, "public")));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Locals (available in every EJS view)
app.use((req, res, next) => {
  res.locals.siteName = "Renal Transplant App (Demo)";
  res.locals.year = new Date().getFullYear();
  next();
});

// Home
app.get("/", (req, res) => {
  const tips = [
    "Take immunosuppressants at the same times daily.",
    "Keep a simple meds log to avoid missed doses.",
    "Ask your clinician before new supplements."
  ];
  res.render("index", { tips });
});

// Dosing helper (GET)
app.get("/dosing", (req, res) => {
  res.render("dosing", { result: null, errors: [] });
});

// Dosing helper (POST) – NON-CLINICAL demo logic
app.post("/dosing", (req, res) => {
  const { drug, weightKg, creatinineUmolL, troughLevelNgmL } = req.body;

  const errors = [];
  const w = Number(weightKg);
  const cr = Number(creatinineUmolL);
  const tl = Number(troughLevelNgmL);

  if (!drug) errors.push("Please choose a drug.");
  if (!Number.isFinite(w) || w <= 0) errors.push("Weight must be a positive number.");
  if (!Number.isFinite(cr) || cr <= 0) errors.push("Creatinine must be a positive number.");
  if (!Number.isFinite(tl) || tl < 0) errors.push("Trough level must be zero or a positive number.");

  let result = null;
  if (errors.length === 0) {
    // Toy “suggestion” engine (just strings for demonstration)
    // Example: tacrolimus target 5–8 ng/mL (NOT clinical guidance)
    if (drug === "tacrolimus") {
      if (tl < 5) {
        result = "Educational suggestion: trough appears low vs a typical 5–8 range; discuss if a small upward adjustment is appropriate.";
      } else if (tl > 8) {
        result = "Educational suggestion: trough appears high vs a typical 5–8 range; discuss if a downward adjustment is appropriate.";
      } else {
        result = "Educational suggestion: trough appears within a common maintenance range; maintain and continue monitoring.";
      }
    } else if (drug === "cyclosporin") {
      result = "Educational suggestion: ensure consistent timing relative to food; review target levels with clinician.";
    } else if (drug === "mycophenolate") {
      result = "Educational suggestion: consider GI tolerance and adherence; consult pharmacist/clinician.";
    } else {
      result = "Educational suggestion: consult transplant pharmacist/clinician regarding individualised dosing.";
    }

    // Add context notes
    if (cr > 150) {
      result += " Note: creatinine is elevated; kidney function/trends should be reviewed clinically.";
    }
    if (w < 40 || w > 120) {
      result += " Note: weight is at an extreme; dosing may require closer professional review.";
    }
  }

  res.render("dosing", { result, errors });
});

// About
app.get("/about", (req, res) => {
  res.render("about");
});

// Contact
app.get("/contact", (req, res) => {
  res.render("contact");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Renal Transplant App running on http://localhost:${PORT}`);
});
