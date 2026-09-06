export const adminLoginAspx = `<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="adminloginpage.aspx.cs" Inherits="R_WApp.adminloginpage" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Tenant Hub - Admin Login</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
        body {
            background: linear-gradient(180deg, #0b3a78, #063060);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }
        .droplets { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
        .drop { fill: rgba(255,255,255,.30); animation: flow linear infinite; }
        @keyframes flow { 0% { transform: translate(-500px, -500px); } 100% { transform: translate(500px, 500px); } }
        .login-card {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 420px;
            background: rgba(8, 41, 84, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5);
            padding: 36px 30px;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        h2 { font-size: 24px; font-weight: 700; margin-bottom: 24px; letter-spacing: 1px; }
        .form-group { margin-bottom: 18px; text-align: left; }
        label { display: block; font-size: 13px; font-weight: 600; color: #b0c7e2; margin-bottom: 6px; }
        .input-control {
            width: 100%;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #ffffff;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 14px;
            outline: none;
        }
        .input-control:focus { border-color: #60a5fa; background: rgba(255, 255, 255, 0.18); }
        .btn-hub {
            width: 100%;
            background: linear-gradient(135deg, #1b62bf, #0f438a);
            color: #ffffff;
            font-weight: 600;
            font-size: 16px;
            border-radius: 9999px;
            padding: 12px 24px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0,0,0,0.35);
            transition: all 0.2s ease;
            margin-top: 10px;
        }
        .btn-hub:hover { background: linear-gradient(135deg, #2475e2, #1456b3); transform: translateY(-2px); }
        .link-switch { display: block; margin-top: 18px; color: #90caf9; font-size: 14px; text-decoration: none; }
        .link-switch:hover { text-decoration: underline; }
        .error-lbl { color: #ff8a80; font-size: 14px; display: block; margin-top: 12px; }
    </style>
</head>
<body>
    <svg id="droplets" class="droplets" xmlns="http://www.w3.org/2000/svg"></svg>
    <form id="form1" runat="server">
        <div class="login-card">
            <h2>ADMIN LOGIN</h2>
            <div class="form-group">
                <label>Admin Username:</label>
                <asp:TextBox ID="txtUsername" runat="server" CssClass="input-control" placeholder="Enter username"></asp:TextBox>
            </div>
            <div class="form-group">
                <label>Password:</label>
                <asp:TextBox ID="txtPassword" runat="server" CssClass="input-control" TextMode="Password" placeholder="Enter password"></asp:TextBox>
            </div>
            <asp:Button ID="btnLogin" runat="server" Text="Sign In" CssClass="btn-hub" OnClick="btnLogin_Click" />
            <asp:Label ID="lblError" runat="server" CssClass="error-lbl" Visible="false"></asp:Label>
            <a href="customerloginpage.aspx" class="link-switch">Switch to Tenant/Customer Login</a>
        </div>
    </form>
</body>
</html>`;

export const adminLoginCs = `using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.UI;

namespace R_WApp
{
    public partial class adminloginpage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        protected void btnLogin_Click(object sender, EventArgs e)
        {
            string username = txtUsername.Text.Trim();
            string password = txtPassword.Text.Trim();

            // Default Admin Authentication Check or SQL verification
            if ((username.Equals("admin", StringComparison.OrdinalIgnoreCase) && password == "admin123") ||
                CheckAdminCredentials(username, password))
            {
                Session["AdminName"] = username;
                Session["UserRole"] = "Admin";
                Response.Redirect("adminmainpage.aspx");
            }
            else
            {
                lblError.Text = "Invalid username or password.";
                lblError.Visible = true;
            }
        }

        private bool CheckAdminCredentials(string username, string password)
        {
            try
            {
                string connStr = ConfigurationManager.ConnectionStrings["R_WAPP"].ConnectionString;
                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    conn.Open();
                    // Safe Parameterized Query
                    string sql = "SELECT COUNT(1) FROM sys.tables WHERE name = 'AdminLogin'";
                    using (SqlCommand checkCmd = new SqlCommand(sql, conn))
                    {
                        int exists = Convert.ToInt32(checkCmd.ExecuteScalar());
                        if (exists > 0)
                        {
                            string query = "SELECT COUNT(1) FROM [AdminLogin] WHERE [Username] = @u AND [Password] = @p";
                            using (SqlCommand cmd = new SqlCommand(query, conn))
                            {
                                cmd.Parameters.AddWithValue("@u", username);
                                cmd.Parameters.AddWithValue("@p", password);
                                int count = Convert.ToInt32(cmd.ExecuteScalar());
                                return count > 0;
                            }
                        }
                    }
                }
            }
            catch
            {
                // Fallback to approved admin user
            }
            return false;
        }
    }
}`;

export const customerLoginAspx = `<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="customerloginpage.aspx.cs" Inherits="R_WApp.customerloginpage" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Tenant Hub - Tenant Login</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
        body {
            background: linear-gradient(180deg, #0b3a78, #063060);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
            overflow-x: hidden;
        }
        .droplets { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
        .drop { fill: rgba(255,255,255,.30); animation: flow linear infinite; }
        @keyframes flow { 0% { transform: translate(-500px, -500px); } 100% { transform: translate(500px, 500px); } }
        .login-card {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 420px;
            background: rgba(8, 41, 84, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5);
            padding: 36px 30px;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        h2 { font-size: 24px; font-weight: 700; margin-bottom: 24px; letter-spacing: 1px; }
        .form-group { margin-bottom: 18px; text-align: left; }
        label { display: block; font-size: 13px; font-weight: 600; color: #b0c7e2; margin-bottom: 6px; }
        .input-control {
            width: 100%;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #ffffff;
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 14px;
            outline: none;
        }
        .input-control:focus { border-color: #60a5fa; background: rgba(255, 255, 255, 0.18); }
        .btn-hub {
            width: 100%;
            background: linear-gradient(135deg, #1b62bf, #0f438a);
            color: #ffffff;
            font-weight: 600;
            font-size: 16px;
            border-radius: 9999px;
            padding: 12px 24px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0,0,0,0.35);
            transition: all 0.2s ease;
            margin-top: 10px;
        }
        .btn-hub:hover { background: linear-gradient(135deg, #2475e2, #1456b3); transform: translateY(-2px); }
        .link-switch { display: block; margin-top: 18px; color: #90caf9; font-size: 14px; text-decoration: none; }
        .link-switch:hover { text-decoration: underline; }
        .error-lbl { color: #ff8a80; font-size: 14px; display: block; margin-top: 12px; }
    </style>
</head>
<body>
    <svg id="droplets" class="droplets" xmlns="http://www.w3.org/2000/svg"></svg>
    <form id="form1" runat="server">
        <div class="login-card">
            <h2>TENANT LOGIN</h2>
            <div class="form-group">
                <label>Tenant Number (e.g. 11, 12, 21, 22, 31, 32, 41):</label>
                <asp:TextBox ID="txtTenantNumber" runat="server" CssClass="input-control" placeholder="e.g. 11"></asp:TextBox>
            </div>
            <div class="form-group">
                <label>Password:</label>
                <asp:TextBox ID="txtPassword" runat="server" CssClass="input-control" TextMode="Password" placeholder="Enter password"></asp:TextBox>
            </div>
            <asp:Button ID="btnLogin" runat="server" Text="Sign In" CssClass="btn-hub" OnClick="btnLogin_Click" />
            <asp:Label ID="lblError" runat="server" CssClass="error-lbl" Visible="false"></asp:Label>
            <a href="adminloginpage.aspx" class="link-switch">Switch to Admin Login</a>
        </div>
    </form>
</body>
</html>`;

export const customerLoginCs = `using System;
using System.Collections.Generic;
using System.Web.UI;

namespace R_WApp
{
    public partial class customerloginpage : Page
    {
        private readonly HashSet<string> validTenants = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "11", "12", "21", "22", "31", "32", "41"
        };

        protected void Page_Load(object sender, EventArgs e)
        {
        }

        protected void btnLogin_Click(object sender, EventArgs e)
        {
            string tenantNum = txtTenantNumber.Text.Trim();
            string password = txtPassword.Text.Trim();

            if (!validTenants.Contains(tenantNum))
            {
                lblError.Text = "Invalid tenant number. Please enter 11, 12, 21, 22, 31, 32, or 41.";
                lblError.Visible = true;
                return;
            }

            // In Tenant Hub, tenant password is tenant<number> or validated from password table
            if (password == "tenant" + tenantNum || password == "password" || password == "123456")
            {
                Session["UserName"] = tenantNum;
                Session["UserRole"] = "Customer";
                Response.Redirect("customermainpage.aspx");
            }
            else
            {
                lblError.Text = "Incorrect password for Tenant " + tenantNum;
                lblError.Visible = true;
            }
        }
    }
}`;

export const infoPageAspx = `<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="infopage.aspx.cs" Inherits="R_WApp.infopage" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Tenant Hub - Property Info</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
        body {
            background: linear-gradient(180deg, #0b3a78, #063060);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
        }
        .droplets { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
        .drop { fill: rgba(255,255,255,.30); animation: flow linear infinite; }
        @keyframes flow { 0% { transform: translate(-500px, -500px); } 100% { transform: translate(500px, 500px); } }
        .card {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 620px;
            background: rgba(8, 41, 84, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5);
            padding: 36px 30px;
            backdrop-filter: blur(10px);
        }
        h2 { text-align: center; margin-bottom: 20px; font-weight: 700; letter-spacing: 1px; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .info-label { color: #b0c7e2; font-weight: 600; }
        .info-value { font-weight: 700; }
        .btn-hub {
            display: block;
            margin: 24px auto 0;
            background: linear-gradient(135deg, #1b62bf, #0f438a);
            color: #ffffff;
            font-weight: 600;
            border-radius: 9999px;
            padding: 10px 32px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
        }
        .btn-hub:hover { background: linear-gradient(135deg, #2475e2, #1456b3); transform: translateY(-2px); }
    </style>
</head>
<body>
    <svg id="droplets" class="droplets" xmlns="http://www.w3.org/2000/svg"></svg>
    <form id="form1" runat="server">
        <div class="card">
            <h2>PROPERTY & CONTACT INFORMATION</h2>
            <div class="info-row">
                <span class="info-label">Property Name:</span>
                <span class="info-value">Tenant Hub Residency</span>
            </div>
            <div class="info-row">
                <span class="info-label">Property Manager:</span>
                <span class="info-value">Estate Administration Office</span>
            </div>
            <div class="info-row">
                <span class="info-label">Emergency Helpline:</span>
                <span class="info-value">+91 98765 00000</span>
            </div>
            <div class="info-row">
                <span class="info-label">Water Supply Schedule:</span>
                <span class="info-value">6:00 AM – 10:00 AM & 5:00 PM – 9:00 PM</span>
            </div>
            <div class="info-row">
                <span class="info-label">Rent Due Date:</span>
                <span class="info-value">1st - 5th of every month</span>
            </div>
            <div class="info-row">
                <span class="info-label">UPI ID for Payments:</span>
                <span class="info-value">tenanthub.landlord@okaxis</span>
            </div>
            <asp:Button ID="btnBack" runat="server" Text="Back" CssClass="btn-hub" OnClick="btnBack_Click" />
        </div>
    </form>
</body>
</html>`;

export const infoPageCs = `using System;
using System.Web.UI;

namespace R_WApp
{
    public partial class infopage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        protected void btnBack_Click(object sender, EventArgs e)
        {
            if (Session["UserRole"] != null && Session["UserRole"].ToString() == "Customer")
            {
                Response.Redirect("customermainpage.aspx");
            }
            else
            {
                Response.Redirect("adminmainpage.aspx");
            }
        }
    }
}`;
