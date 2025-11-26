module.exports = (req, res, next) => {
  if (
    req.method === "POST" &&
    (req.path === "/api/tickets/sell" || req.path === "/sales")
  ) {
    setTimeout(() => {
      res.status(200).json({
        ok: true,
        pnr: "AT-20251102-XYZ",
        message: "Payment step mocked.",
      });
    }, 500);
    return;
  }
  if (
    req.method === "GET" &&
    (req.path === "/api/schedules" || req.path === "/schedules")
  ) {
    if (req.query.date) {
      req.query.departure_like = req.query.date;
      delete req.query.date;
    }
  }

  next();
};
