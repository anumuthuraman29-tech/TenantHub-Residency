export const adminMainAspx = `<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="adminmainpage.aspx.cs" Inherits="R_WApp.adminmainpage" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Tenant Hub - Admin Main Page</title>
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
        .menu-container {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 650px;
            background: rgba(8, 41, 84, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5);
            padding: 40px 30px;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        .hub-title { font-size: 28px; font-weight: 700; letter-spacing: 1px; margin-bottom: 30px; text-transform: uppercase; }
        .admin-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        @media (max-width: 540px) { .admin-columns { grid-template-columns: 1fr; } }
        .col-box { display: flex; flex-direction: column; gap: 16px; }
        .btn-hub {
            background: linear-gradient(135deg, #1b62bf, #0f438a);
            color: #ffffff;
            font-weight: 600;
            font-size: 16px;
            border-radius: 9999px;
            padding: 14px 24px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0,0,0,0.35);
            transition: all 0.2s ease;
            width: 100%;
        }
        .btn-hub:hover { background: linear-gradient(135deg, #2475e2, #1456b3); transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0,0,0,0.45); }
        .btn-logout {
            background: linear-gradient(135deg, #c62828, #8e0000);
            border-color: #ef9a9a;
            max-width: 220px;
            margin: 0 auto;
        }
        .btn-logout:hover { background: linear-gradient(135deg, #d32f2f, #b71c1c); }
        .btn-notify { background: linear-gradient(135deg, #2e7d32, #1b5e20); }
        .btn-notify:hover { background: linear-gradient(135deg, #388e3c, #2e7d32); }
    </style>
</head>
<body>
    <svg id="droplets" class="droplets" xmlns="http://www.w3.org/2000/svg"></svg>
    <form id="form1" runat="server">
        <div class="menu-container">
            <h1 class="hub-title">TENANT HUB - ADMIN</h1>
            
            <div class="admin-columns">
                <!-- Left Column -->
                <div class="col-box">
                    <asp:Button ID="btnRent" runat="server" Text="Rent" CssClass="btn-hub" OnClick="btnRent_Click" />
                    <asp:Button ID="btnWater" runat="server" Text="Water" CssClass="btn-hub" OnClick="btnWater_Click" />
                    <asp:Button ID="btnSendPayment" runat="server" Text="Send Payment Link / SMS" CssClass="btn-hub btn-notify" OnClick="btnSendPayment_Click" />
                </div>

                <!-- Right Column -->
                <div class="col-box">
                    <asp:Button ID="btnInfo" runat="server" Text="Info" CssClass="btn-hub" OnClick="btnInfo_Click" />
                    <asp:Button ID="btnPassword" runat="server" Text="Password" CssClass="btn-hub" OnClick="btnPassword_Click" />
                    <asp:Button ID="btnRentAll" runat="server" Text="Rent All Records" CssClass="btn-hub" OnClick="btnRentAll_Click" />
                </div>
            </div>

            <asp:Button ID="btnLogout" runat="server" Text="Logout" CssClass="btn-hub btn-logout" OnClick="btnLogout_Click" />
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

export const adminMainCs = `using System;
using System.Web.UI;

namespace R_WApp
{
    public partial class adminmainpage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                if (Session["AdminName"] == null && Session["UserName"] == null)
                {
                    Response.Redirect("adminloginpage.aspx");
                }
            }
        }

        protected void btnRent_Click(object sender, EventArgs e)
        {
            Response.Redirect("rentedit.aspx");
        }

        protected void btnWater_Click(object sender, EventArgs e)
        {
            Response.Redirect("wateredit.aspx");
        }

        protected void btnInfo_Click(object sender, EventArgs e)
        {
            Response.Redirect("infopage.aspx");
        }

        protected void btnPassword_Click(object sender, EventArgs e)
        {
            Response.Redirect("passwordallpage.aspx");
        }

        protected void btnSendPayment_Click(object sender, EventArgs e)
        {
            Response.Redirect("sendpayment.aspx");
        }

        protected void btnRentAll_Click(object sender, EventArgs e)
        {
            Response.Redirect("rentallpage.aspx");
        }

        protected void btnLogout_Click(object sender, EventArgs e)
        {
            Session.Clear();
            Session.Abandon();
            Response.Redirect("adminloginpage.aspx");
        }
    }
}`;

export const customerMainAspx = `<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="customermainpage.aspx.cs" Inherits="R_WApp.customermainpage" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Tenant Hub - Customer Portal</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
        body {
            background: linear-gradient(180deg, #0b3a78, #063060);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 24px;
            position: relative;
            overflow-x: hidden;
        }
        .droplets { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
        .drop { fill: rgba(255,255,255,.30); animation: flow linear infinite; }
        @keyframes flow { 0% { transform: translate(-500px, -500px); } 100% { transform: translate(500px, 500px); } }
        .top-bar {
            position: relative;
            z-index: 2;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
        }
        .tenant-badge {
            font-size: 15px;
            font-weight: 600;
            background: rgba(255,255,255,0.12);
            padding: 8px 18px;
            border-radius: 9999px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .top-right-buttons { display: flex; gap: 12px; }
        .center-container {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 480px;
            margin: 40px auto;
            background: rgba(8, 41, 84, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5);
            padding: 36px 28px;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        .hub-title { font-size: 24px; font-weight: 700; letter-spacing: 1px; margin-bottom: 28px; text-transform: uppercase; }
        .btn-hub {
            background: linear-gradient(135deg, #1b62bf, #0f438a);
            color: #ffffff;
            font-weight: 600;
            font-size: 16px;
            border-radius: 9999px;
            padding: 14px 24px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0,0,0,0.35);
            transition: all 0.2s ease;
            width: 100%;
            margin-bottom: 16px;
            display: block;
        }
        .btn-hub:hover { background: linear-gradient(135deg, #2475e2, #1456b3); transform: translateY(-2px); }
        .btn-payment {
            background: linear-gradient(135deg, #2e7d32, #1b5e20);
            border-color: #81c784;
            font-size: 17px;
            letter-spacing: 0.5px;
        }
        .btn-payment:hover { background: linear-gradient(135deg, #388e3c, #2e7d32); }
        .btn-top {
            padding: 8px 20px;
            font-size: 14px;
            width: auto;
            margin-bottom: 0;
        }
        .btn-logout { background: linear-gradient(135deg, #c62828, #8e0000); }
    </style>
</head>
<body>
    <svg id="droplets" class="droplets" xmlns="http://www.w3.org/2000/svg"></svg>
    <form id="form1" runat="server">
        <!-- Top Navigation -->
        <div class="top-bar">
            <div class="tenant-badge">
                <asp:Label ID="lblTenantTitle" runat="server" Text="Welcome Tenant"></asp:Label>
            </div>
            <div class="top-right-buttons">
                <asp:Button ID="btnInfo" runat="server" Text="Info" CssClass="btn-hub btn-top" OnClick="btnInfo_Click" />
                <asp:Button ID="btnLogout" runat="server" Text="Logout" CssClass="btn-hub btn-top btn-logout" OnClick="btnLogout_Click" />
            </div>
        </div>

        <!-- Center Center Buttons: Rent, Payment, Water Bill -->
        <div class="center-container">
            <h2 class="hub-title">TENANT HUB</h2>
            <asp:Button ID="btnRent" runat="server" Text="Rent" CssClass="btn-hub" OnClick="btnRent_Click" />
            <asp:Button ID="btnPayment" runat="server" Text="Payment Details" CssClass="btn-hub btn-payment" OnClick="btnPayment_Click" />
            <asp:Button ID="btnWaterBill" runat="server" Text="Water Bill" CssClass="btn-hub" OnClick="btnWaterBill_Click" />
        </div>

        <div></div>
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

export const customerMainCs = `using System;
using System.Web.UI;

namespace R_WApp
{
    public partial class customermainpage : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                if (Session["UserName"] == null)
                {
                    Response.Redirect("customerloginpage.aspx");
                    return;
                }

                string tenantNum = Session["UserName"].ToString();
                lblTenantTitle.Text = "Tenant " + tenantNum + " Portal";
            }
        }

        protected void btnRent_Click(object sender, EventArgs e)
        {
            Response.Redirect("rentpage.aspx");
        }

        protected void btnPayment_Click(object sender, EventArgs e)
        {
            if (Session["UserName"] == null)
            {
                Response.Redirect("customerloginpage.aspx");
                return;
            }

            // Navigates directly to paymentpage.aspx for logged-in tenant
            Response.Redirect("paymentpage.aspx");
        }

        protected void btnWaterBill_Click(object sender, EventArgs e)
        {
            Response.Redirect("waterbillpage.aspx");
        }

        protected void btnInfo_Click(object sender, EventArgs e)
        {
            Response.Redirect("infopage.aspx");
        }

        protected void btnLogout_Click(object sender, EventArgs e)
        {
            Session.Clear();
            Session.Abandon();
            Response.Redirect("customerloginpage.aspx");
        }
    }
}`;
