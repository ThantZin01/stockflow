export default async function handler(req, res) {
  try {
    const [{ app }, { connectDB }] = await Promise.all([
      import('../src/app.js'),
      import('../src/config/db.js'),
    ]);

    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Serverless handler error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server initialization failed',
    });
  }
}
