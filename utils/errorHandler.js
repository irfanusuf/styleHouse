



const errorHandler = (
    res,
    statusCode = 200,
    page,
    success = true,
    message = "done"
  ) => {
    return res
      .status(statusCode)
      .render(page, { sucess: success, message: message });
  };