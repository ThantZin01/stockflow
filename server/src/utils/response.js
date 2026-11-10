export const sendSuccess = (res, data, statusCode = 200, meta = undefined) => {
  const payload = {
    success: true,
    data,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};
