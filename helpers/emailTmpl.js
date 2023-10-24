const { SERVER_URL } = process.env;

const emailTmpl = (user, _id) => {
  return `
<!DOCTYPE HTML PUBLIC «-//W3C//DTD HTML 4.0 Transitional//EN»>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Your Email is signed</title>
    <meta name="description" content="HTMLemail" />
  </head>

  <body>
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" valign="top" bgcolor="#ffffff" style="background-color:#ffffff;"><br>
                <br>
                <table width="600" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center" valign="top" bgcolor="#ffffff"
                            style="background-color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#000000; padding:0px 15px 0px 15px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="left" valign="top"
                                        style="font-size:13px; font-family:Arial, Helvetica, sans-serif; color:#000000;">
                                        <div
                                            style="font-family:Arial, Helvetica, sans-serif; font-size:72px; color:#000000;  text-align: center;">
                                            <i>Hello, ${user}!</i></div>
                                        <div style="font-size:16px;"><br>
                                            Your address has been added to the MixMasters mailing list. Thank you for your
                                            trust.</div>
    
                                        <div><br>
                                            You can unsubscribe from the mailing list at any time by clicking here: <a href="${SERVER_URL}/api/users/unsubscribe/${_id}">Unsubscribe</a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <br>
                <br>
            </td>
        </tr>
    </table>
  </body>
</html>
`;
};

module.exports = emailTmpl;
