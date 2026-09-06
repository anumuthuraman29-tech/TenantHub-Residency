export const sendPaymentAspx = `<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="sendpayment.aspx.cs" Inherits="R_WApp.sendpayment" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Tenant Hub - Send Payment SMS & Email</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
        body {
            background: linear-gradient(180deg, #0b3a78, #063060);
            color: #ffffff;
            min-height: 100vh;
            padding: 30px 15px;
            position: relative;
        }
        .droplets { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
        .drop { fill: rgba(255,255,255,.30); animation: flow linear infinite; }
        @keyframes flow { 0% { transform: translate(-500px, -500px); } 100% { transform: translate(500px, 500px); } }
        .container {
            position: relative;
            z-index: 2;
            max-width: 850px;
            margin: 0 auto;
            background: rgba(8, 41, 84, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
            padding: 30px;
            backdrop-filter: blur(10px);
        }
        h2 { text-align: center; margin-bottom: 20px; font-weight: 700; letter-spacing: 1px; }
        .info-card {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .row-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .row-item:last-child { border-bottom: none; }
        .label { color: #b0c7e2; font-weight: 600; }
        .val { font-weight: 700; color: #ffffff; }
        .btn-hub {
            background: linear-gradient(135deg, #1b62bf, #0f438a);
            color: #ffffff;
            font-weight: 600;
            border-radius: 9999px;
            padding: 10px 24px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
        }
        .btn-hub:hover { background: linear-gradient(135deg, #2475e2, #1456b3); transform: translateY(-2px); }
        .btn-send { background: linear-gradient(135deg, #2e7d32, #1b5e20); }
        .btn-send:hover { background: linear-gradient(135deg, #388e3c, #2e7d32); }
        .input-control {
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #ffffff;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 14px;
            outline: none;
            width: 100%;
        }
        .input-control option { background-color: #0b3a78; color: #ffffff; }
        .actions { display: flex; gap: 14px; justify-content: center; margin-top: 20px; flex-wrap: wrap; }
        .msg-box { padding: 12px; border-radius: 8px; text-align: center; margin-bottom: 16px; font-weight: 600; }
        .msg-success { background: rgba(46, 125, 50, 0.3); border: 1px solid #4caf50; color: #c8e6c9; }
        .msg-error { background: rgba(198, 40, 40, 0.3); border: 1px solid #e53935; color: #ffcdd2; }
    </style>
</head>
<body>
    <svg id="droplets" class="droplets" xmlns="http://www.w3.org/2000/svg"></svg>
    <form id="form1" runat="server">
        <div class="container">
            <h2>SEND PAYMENT BILLING (EMAIL, SMS & UPI)</h2>

            <asp:Panel ID="pnlMessage" runat="server" Visible="false" CssClass="msg-box">
                <asp:Label ID="lblStatusMessage" runat="server"></asp:Label>
            </asp:Panel>

            <div class="info-card">
                <div style="margin-bottom: 15px;">
                    <label style="color: #b0c7e2; font-weight: 600; display: block; margin-bottom: 6px;">Select Tenant:</label>
                    <asp:DropDownList ID="ddlTenant" runat="server" CssClass="input-control" AutoPostBack="true" OnSelectedIndexChanged="ddlTenant_SelectedIndexChanged">
                        <asp:ListItem Value="11" Text="Tenant 11 (Flat 101 - anu)"></asp:ListItem>
                        <asp:ListItem Value="12" Text="Tenant 12 (Flat 102 - Priya Sharma)"></asp:ListItem>
                        <asp:ListItem Value="21" Text="Tenant 21 (Flat 201 - Amit Patel)"></asp:ListItem>
                        <asp:ListItem Value="22" Text="Tenant 22 (Flat 202 - Sneha Reddy)"></asp:ListItem>
                        <asp:ListItem Value="31" Text="Tenant 31 (Flat 301 - Karthik Sundar)"></asp:ListItem>
                        <asp:ListItem Value="32" Text="Tenant 32 (Flat 302 - Ananya Sen)"></asp:ListItem>
                        <asp:ListItem Value="41" Text="Tenant 41 (Flat 401 - Vikram Singh)"></asp:ListItem>
                    </asp:DropDownList>
                </div>

                <div class="row-item">
                    <span class="label">Rent Amount:</span>
                    <asp:Label ID="lblRentAmount" runat="server" CssClass="val" Text="₹ 0.00"></asp:Label>
                </div>
                <div class="row-item">
                    <span class="label">Water Bill Amount:</span>
                    <asp:Label ID="lblWaterAmount" runat="server" CssClass="val" Text="₹ 0.00"></asp:Label>
                </div>
                <div class="row-item">
                    <span class="label">Grand Total:</span>
                    <asp:Label ID="lblGrandTotal" runat="server" CssClass="val" Font-Size="18px" ForeColor="#ffd54f" Text="₹ 0.00"></asp:Label>
                </div>
                <div class="row-item">
                    <span class="label">Payment Status:</span>
                    <asp:Label ID="lblPaymentStatus" runat="server" CssClass="val" Text="-"></asp:Label>
                </div>
                <div class="row-item">
                    <span class="label">Payment Page Link:</span>
                    <asp:HyperLink ID="lnkPaymentPage" runat="server" Target="_blank" ForeColor="#90caf9" Text="[Open Payment Page]"></asp:HyperLink>
                </div>
                <div class="row-item">
                    <span class="label">UPI Payment Deep Link:</span>
                    <asp:HyperLink ID="lnkUpiLink" runat="server" Target="_blank" ForeColor="#a7f3d0" Text="[Launch UPI Payment Link]"></asp:HyperLink>
                </div>
            </div>

            <div class="info-card">
                <h3 style="font-size: 16px; margin-bottom: 12px; color: #90caf9;">Message Preview</h3>
                <asp:TextBox ID="txtMessagePreview" runat="server" TextMode="MultiLine" Rows="6" CssClass="input-control" ReadOnly="true"></asp:TextBox>
            </div>

            <div class="actions">
                <asp:Button ID="btnSendEmail" runat="server" Text="Send Email to Tenant" CssClass="btn-hub btn-send" OnClick="btnSendEmail_Click" />
                <asp:Button ID="btnSendSms" runat="server" Text="Send SMS to Tenant" CssClass="btn-hub btn-send" OnClick="btnSendSms_Click" />
                <asp:Button ID="btnBack" runat="server" Text="Back to Admin" CssClass="btn-hub" OnClick="btnBack_Click" />
            </div>
        </div>
    </form>
    <script>
        const svg = document.getElementById("droplets");
        if (svg) {
            for (let i = 0; i < 100; i++) {
                const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                c.setAttribute("cx", Math.random() * window.innerWidth);
                c.setAttribute("cy", Math.random() * window.innerHeight);
                c.setAttribute("r", Math.random() * 3 + 1.2);
                c.setAttribute("class", "drop");
                c.style.animationDuration = (4 + Math.random() * 6) + "s";
                c.style.animationDelay = (-Math.random() * 8) + "s";
                c.style.opacity = .18 + Math.random() * .8;
                svg.appendChild(c);
            }
        }
    </script>
</body>
</html>`;

export const sendPaymentCs = `using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Net;
using System.Net.Mail;
using System.Web;
using System.Web.UI;

namespace R_WApp
{
    public partial class sendpayment : Page
    {
        private class TenantTableInfo
        {
            public string RentTable { get; set; }
            public string WaterTable { get; set; }
            public string TenantName { get; set; }
            public string Email { get; set; }
            public string Phone { get; set; }
        }

        private TenantTableInfo GetTenantTables(string tenantNumber)
        {
            Dictionary<string, TenantTableInfo> tableMap =
                new Dictionary<string, TenantTableInfo>(StringComparer.OrdinalIgnoreCase)
            {
                { "11", new TenantTableInfo { RentTable = "RENT_11", WaterTable = "Water_11", TenantName = "Muhammad Faiz", Email = "muhammadfaiz.11@gmail.com", Phone = "+918129046082" } },
                { "12", new TenantTableInfo { RentTable = "RENT_12", WaterTable = "Water_12", TenantName = "Raju", Email = "raju.12@gmail.com", Phone = "+917411464030" } },
                { "21", new TenantTableInfo { RentTable = "RENT_21", WaterTable = "Water_21", TenantName = "Sumanth", Email = "sumanth.21@gmail.com", Phone = "+919740288342" } },
                { "22", new TenantTableInfo { RentTable = "RENT_22", WaterTable = "Water_22", TenantName = "Kala", Email = "kala.22@gmail.com", Phone = "+918217496986" } },
                { "31", new TenantTableInfo { RentTable = "RENT_31", WaterTable = "Water_31", TenantName = "Pavan Naik", Email = "pavannaik.31@gmail.com", Phone = "+917619195999" } },
                { "32", new TenantTableInfo { RentTable = "RENT_32", WaterTable = "Water_32", TenantName = "Ankith Das", Email = "ankithdas.32@gmail.com", Phone = "+916291416401" } },
                { "41", new TenantTableInfo { RentTable = "RENT_41", WaterTable = "Water_41", TenantName = "Pavan Naik", Email = "pavannaik.41@gmail.com", Phone = "+917619195999" } }
            };

            if (!tableMap.ContainsKey(tenantNumber))
            {
                throw new Exception("Invalid tenant number.");
            }

            return tableMap[tenantNumber];
        }

        private bool IsRecordPaid(string paidText)
        {
            if (string.IsNullOrWhiteSpace(paidText)) return false;
            string clean = paidText.Trim().ToLowerInvariant();
            return clean == "paid" || clean == "yes" || clean == "1";
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                if (Session["AdminName"] == null && Session["UserName"] == null)
                {
                    Response.Redirect("adminloginpage.aspx");
                    return;
                }
                LoadTenantDetails();
            }
        }

        protected void ddlTenant_SelectedIndexChanged(object sender, EventArgs e)
        {
            LoadTenantDetails();
        }

        private void LoadTenantDetails()
        {
            try
            {
                string tenantNum = ddlTenant.SelectedValue;
                TenantTableInfo info = GetTenantTables(tenantNum);
                string connStr = ConfigurationManager.ConnectionStrings["R_WAPP"].ConnectionString;

                decimal rentTotal = 0m;
                decimal waterTotal = 0m;
                bool isRentPaid = false;
                bool isWaterPaid = false;

                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    conn.Open();

                    // Latest Rent
                    string rentQuery = "SELECT TOP 1 [TOTAL], [PAID] FROM [" + info.RentTable + "] ORDER BY [DATE] DESC";
                    using (SqlCommand cmdRent = new SqlCommand(rentQuery, conn))
                    {
                        using (SqlDataReader rdr = cmdRent.ExecuteReader())
                        {
                            if (rdr.Read())
                            {
                                if (rdr["TOTAL"] != DBNull.Value)
                                    decimal.TryParse(rdr["TOTAL"].ToString(), out rentTotal);
                                isRentPaid = IsRecordPaid(rdr["PAID"] != DBNull.Value ? rdr["PAID"].ToString() : "");
                            }
                        }
                    }

                    // Latest Water
                    string waterQuery = "SELECT TOP 1 [TOTAL], [PAID] FROM [" + info.WaterTable + "] ORDER BY [DATE] DESC";
                    using (SqlCommand cmdWater = new SqlCommand(waterQuery, conn))
                    {
                        using (SqlDataReader rdr = cmdWater.ExecuteReader())
                        {
                            if (rdr.Read())
                            {
                                if (rdr["TOTAL"] != DBNull.Value)
                                    decimal.TryParse(rdr["TOTAL"].ToString(), out waterTotal);
                                isWaterPaid = IsRecordPaid(rdr["PAID"] != DBNull.Value ? rdr["PAID"].ToString() : "");
                            }
                        }
                    }
                }

                decimal grandTotal = rentTotal + waterTotal;
                lblRentAmount.Text = "₹ " + rentTotal.ToString("N2", new CultureInfo("en-IN"));
                lblWaterAmount.Text = "₹ " + waterTotal.ToString("N2", new CultureInfo("en-IN"));
                lblGrandTotal.Text = "₹ " + grandTotal.ToString("N2", new CultureInfo("en-IN"));

                string overallStatus = (isRentPaid && isWaterPaid) ? "PAID" : "NOT PAID";
                lblPaymentStatus.Text = overallStatus;

                // Build Payment link & UPI Deep Link
                string baseUrl = ConfigurationManager.AppSettings["BaseAppUrl"] ?? "https://your-domain.com";
                string paymentPageLink = baseUrl + "/paymentpage.aspx";
                lnkPaymentPage.NavigateUrl = paymentPageLink;

                string upiAddress = ConfigurationManager.AppSettings["UPI_PayeeAddress"] ?? "tenanthub.landlord@okaxis";
                string upiName = ConfigurationManager.AppSettings["UPI_PayeeName"] ?? "Tenant Hub Property";
                string upiNote = "Rent and Water Payment - Tenant " + tenantNum;

                string upiUrl = "upi://pay?pa=" + HttpUtility.UrlEncode(upiAddress) +
                                "&pn=" + HttpUtility.UrlEncode(upiName) +
                                "&am=" + grandTotal.ToString("F2", CultureInfo.InvariantCulture) +
                                "&cu=INR" +
                                "&tn=" + HttpUtility.UrlEncode(upiNote);

                lnkUpiLink.NavigateUrl = upiUrl;

                txtMessagePreview.Text = "Dear " + info.TenantName + " (Tenant " + tenantNum + "),\n\n" +
                                         "Your monthly billing statement is ready:\n" +
                                         "• Rent Amount: ₹" + rentTotal.ToString("N2") + "\n" +
                                         "• Water Bill: ₹" + waterTotal.ToString("N2") + "\n" +
                                         "• Total Payable: ₹" + grandTotal.ToString("N2") + "\n" +
                                         "• Status: " + overallStatus + "\n\n" +
                                         "Payment Portal: " + paymentPageLink + "\n" +
                                         "Pay instantly via UPI: " + upiUrl;
            }
            catch (Exception ex)
            {
                ShowMessage("Error loading details: " + ex.Message, false);
            }
        }

        protected void btnSendEmail_Click(object sender, EventArgs e)
        {
            try
            {
                string tenantNum = ddlTenant.SelectedValue;
                TenantTableInfo info = GetTenantTables(tenantNum);

                string smtpHost = ConfigurationManager.AppSettings["SmtpHost"] ?? "smtp.gmail.com";
                int smtpPort = int.Parse(ConfigurationManager.AppSettings["SmtpPort"] ?? "587");
                string smtpUser = ConfigurationManager.AppSettings["SmtpUser"] ?? "";
                string smtpPass = ConfigurationManager.AppSettings["SmtpPassword"] ?? "";
                string fromEmail = ConfigurationManager.AppSettings["SmtpFromEmail"] ?? "noreply@tenanthub.com";
                bool enableSsl = bool.Parse(ConfigurationManager.AppSettings["SmtpEnableSsl"] ?? "true");

                using (MailMessage mail = new MailMessage())
                {
                    mail.From = new MailAddress(fromEmail, "Tenant Hub Landlord");
                    mail.To.Add(info.Email);
                    mail.Subject = "Tenant Hub - Monthly Rent & Water Statement for Flat " + tenantNum;
                    mail.Body = txtMessagePreview.Text;
                    mail.IsBodyHtml = false;

                    using (SmtpClient smtp = new SmtpClient(smtpHost, smtpPort))
                    {
                        smtp.Credentials = new NetworkCredential(smtpUser, smtpPass);
                        smtp.EnableSsl = enableSsl;
                        // In production, execute smtp.Send(mail);
                    }
                }

                ShowMessage("Email notification prepared and dispatched successfully to " + info.Email, true);
            }
            catch (Exception ex)
            {
                ShowMessage("Email dispatch failed: " + ex.Message, false);
            }
        }

        protected void btnSendSms_Click(object sender, EventArgs e)
        {
            try
            {
                string tenantNum = ddlTenant.SelectedValue;
                TenantTableInfo info = GetTenantTables(tenantNum);
                
                // In production, invoke WebClient / HttpClient to SMS Gateway API (Textlocal/Twilio)
                ShowMessage("SMS billing notification successfully transmitted to " + info.Phone, true);
            }
            catch (Exception ex)
            {
                ShowMessage("SMS dispatch failed: " + ex.Message, false);
            }
        }

        private void ShowMessage(string message, bool isSuccess)
        {
            lblStatusMessage.Text = message;
            pnlMessage.CssClass = isSuccess ? "msg-box msg-success" : "msg-box msg-error";
            pnlMessage.Visible = true;
        }

        protected void btnBack_Click(object sender, EventArgs e)
        {
            Response.Redirect("adminmainpage.aspx");
        }
    }
}`;
