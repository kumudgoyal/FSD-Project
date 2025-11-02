// src/middleware/roleCheck.js

// This middleware allows only specific roles to access a route
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role; // decoded from JWT in verifyToken

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Access denied: You do not have permission.",
        });
      }

      next(); // user has permission, continue
    } catch (err) {
      res.status(401).json({ message: "Authorization error" });
    }
  };
};
