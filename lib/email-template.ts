interface CouponEmailParams {
  name: string;
  teamName: string;
  couponCode: string;
  qrCodeURL: string;
  foodPreference: 'veg' | 'non-veg';
  totalRegistrations: number;
  vegCount: number;
  nonVegCount: number;
}

export function buildCouponEmailHTML(params: CouponEmailParams): string {
  const { name, teamName, couponCode, qrCodeURL, foodPreference, totalRegistrations, vegCount, nonVegCount } = params;
  const foodLabel = foodPreference === 'veg' ? '🟢 Vegetarian' : '🔴 Non-Vegetarian';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                🎫 IEDC Food Coupon
              </h1>
              <p style="margin:8px 0 0;color:#a0aec0;font-size:13px;">
                Your meal pass for the event
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              
              <!-- Greeting -->
              <p style="margin:0 0 20px;color:#2d3748;font-size:15px;line-height:1.6;">
                Hi <strong>${name}</strong>,<br />
                Your food coupon has been generated successfully! Present this at the food counter to claim your meal.
              </p>

              <!-- Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#718096;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Name</td>
                      </tr>
                      <tr>
                        <td style="color:#2d3748;font-size:15px;font-weight:600;padding-bottom:12px;">${name}</td>
                      </tr>
                      <tr>
                        <td style="color:#718096;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Team</td>
                      </tr>
                      <tr>
                        <td style="color:#2d3748;font-size:15px;font-weight:600;padding-bottom:12px;">${teamName}</td>
                      </tr>
                      <tr>
                        <td style="color:#718096;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Meal Type</td>
                      </tr>
                      <tr>
                        <td style="color:#2d3748;font-size:15px;font-weight:600;">${foodLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Registration Counts -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#edf2f7;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#718096;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Total Registrations</td>
                      </tr>
                      <tr>
                        <td style="color:#2d3748;font-size:20px;font-weight:700;padding-bottom:14px;">${totalRegistrations}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:6px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color:#718096;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-right:24px;">🟢 Veg</td>
                              <td style="color:#2d3748;font-size:15px;font-weight:600;">${vegCount}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color:#718096;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-right:24px;">🔴 Non-Veg</td>
                              <td style="color:#2d3748;font-size:15px;font-weight:600;">${nonVegCount}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Verification Code -->
              <div style="text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 8px;color:#718096;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;">
                  Verification Code
                </p>
                <div style="display:inline-block;background-color:#1a1a2e;color:#ffffff;font-size:32px;font-weight:700;letter-spacing:8px;padding:16px 32px;border-radius:8px;">
                  ${couponCode}
                </div>
              </div>

              <!-- QR Code -->
              <div style="text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 12px;color:#718096;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;">
                  Scan QR Code
                </p>
                <img src="${qrCodeURL}" alt="Food Coupon QR Code" width="200" height="200" style="border-radius:8px;border:1px solid #e2e8f0;" />
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f7fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#a0aec0;font-size:12px;line-height:1.5;">
                Show this email at the food counter for verification.<br />
                This coupon is valid for one-time use only.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
