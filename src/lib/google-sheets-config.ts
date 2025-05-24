/**
 * Google Sheets Configuration
 * 
 * This file contains the configuration for Google Sheets integration.
 * For security, in production, store these values in environment variables.
 */

// Google Sheets configuration
export const GOOGLE_SHEETS_CONFIG = {
  // Spreadsheet ID for June menu selections
  spreadsheetId: process.env.GOOGLE_SHEET_ID || '10wToXCkzryk-MuKNx7jhxVMtkiCXokTiQiuWizYci38',
  
  // Sheet name for June menu selections
  // Using the sheet name from the shared spreadsheet
  sheetName: process.env.GOOGLE_SHEET_NAME || 'June Menu Selections',
  
  // Service account credentials
  credentials: {
    type: 'service_account',
    project_id: 'gen-lang-client-0975191063',
    private_key_id: '5070b7e7e5a961bfef08f09af642f4d7e39c0a47',
    private_key: process.env.GOOGLE_PRIVATE_KEY || 
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpeyr9J7lha2ty\nDmsWZdd1ewlL1nsmnObdIGRJPzWkWjef3J9ovUmjOobD7V6WSTZwmkoyGtL+Zhr2\ndXJl6rtSZfO+YwnhJZ9oSy9QMCh00nbnM5LCjof4nXIQm2Aoor6I0LoopyjCjP8f\nSh/6vDH5fvXRqVfGMygJZgD4Fhxwg+RrTx7uDJxkTdIgQAIsyUIMuCegwMTVZvB6\nn+OSd/G9nkK5YDsbd2xbr/1uy7PCGlY35pQPEycqIYBs5Yugq5iPhzkpBk22EK0d\nFkIdzFmfg2DEnz5MEpARpgG/ELO15iaJgQpOkV98eZimu8e/FMtySuBN7pMBlPRy\ntgL7fJQtAgMBAAECggEAICmcleA1APTWthVgYya+ha/sqrSwODqsYShlf7T8JA1u\n4uqGYeUSFWTk8EeanKCWMTZGgE2w3tBXq4/MPuUV2WQ5pla7KDvwjWU/PFN3Sfwq\nzmNuJXfQ+/A9FkO2Mt/3kpUxzscyKAGD5Nc3TGjsfvGGCty9KILKxUXTR0FC8mL2\nJeYMa9oVOdF1u+FtvlMqPilQggJ5k+bhkxgVlInhbd04fuIP6hYpybMKF09Dd85D\nYcXWCHeVMLOBokrAPCIYGZwz0YkNVpJjVPphj1oyaDJX1ZjfzAGZ0qemtashQ/Kd\nKK//6zu5/zARdwZ0/K13Ex/wDdwU6ve71Lh+TVDY4QKBgQDRf1rkxAbGRaPiLqBA\nL0ffFHK6FPaAtnBEfqNCvaKijhkqZHQHHdEnhApCVMG6KL3eL6NZZsyoO5F3ZfPq\nzuNxGlTsDT+7Hcza/P/YOVOhi0rKvhr46DBSBoFTudxVnOefqaFSBjE/fGrmKaf/\ni44wjT1eDhGaLQTQYp00egQz1QKBgQDPGeSTtJpOKowPFH1UM584qdszuDsS0KyU\nxDD6unS7JxEzgAi8f8c/JLyvoR9thniKjpEpxb0V+DO7GeoFntSPszBBLOIoTt5y\npoFbDpyKK0zxVg7qP3E9usEGwBErtQA7rQdfS14P2AAHNZdvdkUCgEuLZI+p/lrv\noHGqjMSC+QKBgQCnqccywvexAtcQE8TI2Y4pqRHQfypxBJGBH+DFb0OT2Smm1dJO\nR7y2ZWRYhcCtniGminWu/SjZkyLubbfyujUotaw1Zr0UodrrgAO6JtcZuILZE6A+\niITzgKVMPrlqAzMUgwvKu436gzaCkeAUErpvfPoaJiRMQa9Snzm1X9mxKQKBgHXe\nA7R43jVMi8ftXmL0ulKygToPSTetIfvNKR8ZzWPSmTyZSt+VTZ3HV8gRSGS6WpJp\nD38ZtkLxrud2mTU3rzxVvEnrtI9CS+Iul4Jub3NHr5PO6dAx6U47oq4n093vNsG/\n+Wkn6NHVmjaALr7WLfJ9eAFOa2FRjQnCY86wLQtpAoGAEzhIYTLcb5Ec95SGcMnb\no9DVykHFGG5HEv1GBZHUnzfeFbKIQ9oHVYlhN4pDiMRyx7do/Khbwz7EjtoIRpMo\nL+w9QEwRZxJoUClfE38X5z7jNvfPjssXurUXsDyVAv2eCFuA94OnE6IVWGhGZ7zP\nIPIVX4c1w5XBc3qDbHjJlps=\n-----END PRIVATE KEY-----\n",
    client_email: 'extrabite@gen-lang-client-0975191063.iam.gserviceaccount.com',
    client_id: '100052187562924689423',
  }
};

/**
 * NOTE ON SECURITY:
 * 
 * In production, you should NOT store private keys directly in your code.
 * Instead, use environment variables or a secure secret management service.
 * 
 * The configuration above includes the private key for development purposes only.
 * When deploying to production, make sure to set the GOOGLE_PRIVATE_KEY environment variable.
 */
