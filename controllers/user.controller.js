const bcrypt = require("bcrypt");
const userModel = require("../model/user.model");

const getSignupForm = (req, res) => {
  res.render("userForm");
};

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).render("userForm", {
        message: "Please provide all required fields",
      });
    }

    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).render("userForm", {
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser(
      name,
      email,
      hashedPassword,
      "staff",
    );

    res.redirect("/user/login?signup=success");
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).render("userForm", {
      message: "Error during signup. Please try again.",
    });
  }
};

const getLoginForm = (req, res) => {
  const signupSuccess = req.query.signup === "success";
  res.render("loginForm", { signupSuccess });
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render("loginForm", {
        message: "Please provide email and password",
        signupSuccess: false,
      });
    }

    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).render("loginForm", {
        message: "Invalid email or password",
        signupSuccess: false,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).render("loginForm", {
        message: "Invalid email or password",
        signupSuccess: false,
      });
    }

    req.session = req.session || {};
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).render("loginForm", {
      message: "Error during login. Please try again.",
      signupSuccess: false,
    });
  }
};

const logoutUser = (req, res) => {
  try {
    if (req.session) {
      if (typeof req.session.destroy === "function") {
        req.session.destroy((err) => {
          if (err) console.error("Session destroy error:", err);
          return res.redirect("/user/login");
        });
        return;
      }

      req.session = null;
    }
    return res.redirect("/user/login");
  } catch (err) {
    console.error("Logout error:", err);
    return res.redirect("/user/login");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
};

module.exports = {
  getSignupForm,
  createUser,
  getLoginForm,
  loginUser,
  logoutUser,
  getAllUsers,
  getUserById,
};
