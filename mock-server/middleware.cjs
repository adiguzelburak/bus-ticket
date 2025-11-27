module.exports = (req, res, next) => {
  if (
    req.method === "POST" &&
    (req.path === "/api/tickets/sell" || req.path === "/sales")
  ) {
    setTimeout(() => {
      res.status(200).json({
        ok: true,
        pnr: "AT-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.random().toString(36).substring(2, 5).toUpperCase(),
        message: "Payment step mocked",
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