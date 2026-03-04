export const errorHandler = (err, req, res, next) => {
  console.error("💥 Server Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
};
