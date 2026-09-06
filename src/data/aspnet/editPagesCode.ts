export const rentEditAspx = `<%@ Page Language="C#"
    AutoEventWireup="true"
    CodeBehind="rentedit.aspx.cs"
    Inherits="R_WApp.rentedit" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Tenant Hub - Rent Management</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        html, body {
            margin: 0;
            min-height: 100%;
            overflow-y: auto;
            font-family: "Segoe UI", Arial, sans-serif;
            background: linear-gradient(180deg, #0b3a78, #063060);
            color: #ffffff;
        }

        .droplets {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .drop {
            fill: rgba(255,255,255,.30);
            animation: flow linear infinite;
        }

        @keyframes flow {
            0% {
                transform: translate(-500px, -500px);
            }
            100% {
                transform: translate(500px, 500px);
            }
        }

        .content {
            position: relative;
            z-index: 2;
            padding: 20px;
            max-width: 1100px;
            margin: 0 auto;
        }

        .backbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .title {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #ffffff;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .backbtn {
            background: linear-gradient(135deg, #f97316, #ec4899);
            color: #ffffff;
            font-weight: 600;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 9999px;
            padding: 8px 22px;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            transition: all 0.2s ease;
            text-decoration: none;
        }

        .backbtn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.35);
        }

        .centerbox {
            background: rgba(8, 41, 84, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
            padding: 24px;
            backdrop-filter: blur(10px);
            margin-bottom: 24px;
        }

        .fieldrow {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }

        .fieldgroup {
            display: flex;
            flex-direction: column;
        }

        .label {
            font-size: 12px;
            font-weight: 600;
            color: #b0c7e2;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .textbox {
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #ffffff;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 14px;
            outline: none;
            transition: all 0.2s ease;
        }

        .textbox:focus {
            border-color: #60a5fa;
            background: rgba(255, 255, 255, 0.18);
        }

        .readonly {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.15);
            color: #cbd5e1;
            cursor: not-allowed;
        }

        .btnrow {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 10px;
        }

        .actionbtn {
            background: linear-gradient(135deg, #1b62bf, #0f438a);
            color: #ffffff;
            font-weight: 600;
            border-radius: 9999px;
            padding: 9px 24px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
            font-size: 14px;
        }

        .actionbtn:hover {
            background: linear-gradient(135deg, #2475e2, #1456b3);
            transform: translateY(-2px);
        }

        .gridwrap {
            overflow-x: auto;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.15);
            box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        }

        .Grid {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            background: rgba(8, 41, 84, 0.7);
        }

        .Grid th {
            background: rgba(27, 98, 191, 0.85);
            color: #ffffff;
            padding: 12px 10px;
            text-align: left;
            border: 1px solid rgba(255,255,255,0.15);
            font-weight: 600;
            white-space: nowrap;
        }

        .Grid td {
            padding: 10px;
            border: 1px solid rgba(255,255,255,0.1);
            color: #e2e8f0;
            white-space: nowrap;
        }

        .Grid tr:nth-child(even) {
            background: rgba(255,255,255,0.04);
        }

        .Grid tr:hover {
            background: rgba(255,255,255,0.1);
        }

        .Grid a {
            color: #38bdf8;
            text-decoration: none;
            font-weight: 600;
        }

        .Grid a:hover {
            text-decoration: underline;
        }
    </style>
    <script type="text/javascript">
        function calcTotal() {
            var p = parseFloat(
                document.getElementById(
                    '<%= txtPayment.ClientID %>'
                ).value
            ) || 0;

            var b = parseFloat(
                document.getElementById(
                    '<%= txtBalance.ClientID %>'
                ).value
            ) || 0;

            document.getElementById(
                '<%= txtTotal.ClientID %>'
            ).value = (p + b).toFixed(2);
        }
    </script>
</head>
<body class="page">
    <svg id="droplets" class="droplets" xmlns="http://www.w3.org/2000/svg"></svg>
    <form id="form1" runat="server">
        <div class="content">
            <div class="backbar">
                <div class="title">Rent Management (Admin)</div>
                <asp:Button
                    ID="btnBack"
                    runat="server"
                    Text="Back"
                    CssClass="backbtn"
                    OnClick="btnBack_Click" />
            </div>

            <div class="centerbox">
                <div class="fieldrow">
                    <div class="fieldgroup">
                        <label class="label">Date</label>
                        <asp:TextBox
                            ID="txtDate"
                            runat="server"
                            CssClass="textbox"
                            TextMode="Date"></asp:TextBox>
                    </div>

                    <div class="fieldgroup">
                        <label class="label">Day</label>
                        <asp:TextBox
                            ID="txtDay"
                            runat="server"
                            CssClass="textbox readonly"
                            ReadOnly="true"></asp:TextBox>
                    </div>

                    <div class="fieldgroup">
                        <label class="label">Payment</label>
                        <asp:TextBox
                            ID="txtPayment"
                            runat="server"
                            CssClass="textbox"
                            onkeyup="calcTotal()"></asp:TextBox>
                    </div>

                    <div class="fieldgroup">
                        <label class="label">Balance</label>
                        <asp:TextBox
                            ID="txtBalance"
                            runat="server"
                            CssClass="textbox readonly"
                            ReadOnly="true"
                            onkeyup="calcTotal()"></asp:TextBox>
                    </div>

                    <div class="fieldgroup">
                        <label class="label">Total</label>
                        <asp:TextBox
                            ID="txtTotal"
                            runat="server"
                            CssClass="textbox readonly"
                            ReadOnly="true"></asp:TextBox>
                    </div>

                    <div class="fieldgroup">
                        <label class="label">Mode of Payment</label>
                        <asp:TextBox
                            ID="txtMode"
                            runat="server"
                            CssClass="textbox"></asp:TextBox>
                    </div>

                    <div class="fieldgroup">
                        <label class="label">Paid</label>
                        <asp:TextBox
                            ID="txtPaid"
                            runat="server"
                            CssClass="textbox"></asp:TextBox>
                    </div>
                </div>

                <div class="btnrow">
                    <asp:Button
                        ID="btnAdd"
                        runat="server"
                        Text="Add"
                        CssClass="actionbtn"
                        OnClick="btnAdd_Click" />

                    <asp:Button
                        ID="btnUpdate"
                        runat="server"
                        Text="Update"
                        CssClass="actionbtn"
                        OnClick="btnUpdate_Click" />

                    <asp:Button
                        ID="btnDelete"
                        runat="server"
                        Text="Delete"
                        CssClass="actionbtn"
                        OnClick="btnDelete_Click" />

                    <asp:Button
                        ID="btnClear"
                        runat="server"
                        Text="Clear"
                        CssClass="actionbtn"
                        OnClick="btnClear_Click" />
                </div>
            </div>

            <div class="gridwrap">
                <asp:GridView
                    ID="gvRent"
                    runat="server"
                    CssClass="Grid"
                    AutoGenerateColumns="false"
                    OnSelectedIndexChanged="gvRent_SelectedIndexChanged">

                    <Columns>
                        <asp:CommandField
                            ShowSelectButton="True"
                            SelectText="Select" />

                        <asp:BoundField
                            DataField="DATE"
                            HeaderText="Date" />

                        <asp:BoundField
                            DataField="DAY"
                            HeaderText="Day" />

                        <asp:BoundField
                            DataField="PAYMENT"
                            HeaderText="Payment" />

                        <asp:BoundField
                            DataField="BALANCE"
                            HeaderText="Balance" />

                        <asp:BoundField
                            DataField="TOTAL"
                            HeaderText="Total" />

                        <asp:BoundField
                            DataField="MODE OF PAYMENT"
                            HeaderText="Mode of Payment" />

                        <asp:BoundField
                            DataField="PAID"
                            HeaderText="Paid" />
                    </Columns>
                </asp:GridView>
            </div>
        </div>
    </form>

    <script type="text/javascript">
        var svg = document.getElementById("droplets");
        if (svg) {
            for (var i = 0; i < 100; i++) {
                var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
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

export const rentEditCs = `using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Collections.Generic;

namespace R_WApp
{
    public partial class rentedit : System.Web.UI.Page
    {
        string connStr =
            ConfigurationManager.ConnectionStrings["R_WAPP"].ConnectionString;

        protected void Page_Load(object sender, EventArgs e)
        {
            if (Session["AdminName"] == null)
            {
                Response.Redirect("adminloginpage.aspx");
                return;
            }

            if (!IsPostBack)
            {
                LoadGrid();
            }
        }

        private string GetTableName()
        {
            string table = Request.QueryString["table"];

            HashSet<string> allowedTables =
                new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "RENT_11",
                "RENT_12",
                "RENT_21",
                "RENT_22",
                "RENT_31",
                "RENT_32",
                "RENT_41"
            };

            if (string.IsNullOrEmpty(table) ||
                !allowedTables.Contains(table))
            {
                return "RENT_11";
            }

            return table;
        }

        private void LoadGrid()
        {
            string tableName = GetTableName();

            using (SqlConnection con = new SqlConnection(connStr))
            using (SqlDataAdapter da =
                   new SqlDataAdapter(
                       "SELECT * FROM " + tableName +
                       " ORDER BY [DATE]", con))
            {
                DataTable dt = new DataTable();
                da.Fill(dt);
                gvRent.DataSource = dt;
                gvRent.DataBind();
            }
        }

        private decimal GetOutstandingBalanceBeforeNewEntry()
        {
            string tableName = GetTableName();

            using (SqlConnection con = new SqlConnection(connStr))
            {
                string query = "SELECT ISNULL(SUM([PAYMENT]), 0) " +
                               "FROM " + tableName + " " +
                               "WHERE UPPER(LTRIM(RTRIM(ISNULL([PAID], '')))) = 'NOT PAID'";

                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    con.Open();
                    object result = cmd.ExecuteScalar();
                    if (result != null && result != DBNull.Value)
                    {
                        return Convert.ToDecimal(result);
                    }
                }
            }

            return 0m;
        }

        private void RecalculateBalances()
        {
            string tableName = GetTableName();
            DataTable dt = new DataTable();

            using (SqlConnection con = new SqlConnection(connStr))
            {
                using (SqlDataAdapter da =
                       new SqlDataAdapter("SELECT [DATE], [PAYMENT], [PAID] FROM " + tableName + " ORDER BY [DATE]", con))
                {
                    da.Fill(dt);
                }

                decimal previousUnpaid = 0;

                con.Open();
                foreach (DataRow row in dt.Rows)
                {
                    decimal payment = 0;
                    if (row["PAYMENT"] != DBNull.Value)
                    {
                        decimal.TryParse(row["PAYMENT"].ToString(), out payment);
                    }

                    decimal balance = previousUnpaid;
                    decimal total = payment + balance;

                    string updateSql = "UPDATE " + tableName + " " +
                                       "SET [BALANCE] = @BALANCE, [TOTAL] = @TOTAL " +
                                       "WHERE [DATE] = @DATE";

                    using (SqlCommand cmd = new SqlCommand(updateSql, con))
                    {
                        cmd.Parameters.AddWithValue("@BALANCE", balance);
                        cmd.Parameters.AddWithValue("@TOTAL", total);
                        cmd.Parameters.AddWithValue("@DATE", row["DATE"]);
                        cmd.ExecuteNonQuery();
                    }

                    string paid = row["PAID"] != DBNull.Value ? row["PAID"].ToString().Trim().ToUpper() : "";
                    if (paid == "NOT PAID")
                    {
                        previousUnpaid += payment;
                    }
                }
            }

            LoadGrid();
        }

        protected void btnAdd_Click(object sender, EventArgs e)
        {
            string tableName = GetTableName();

            DateTime dateVal;
            if (!DateTime.TryParse(txtDate.Text.Trim(), out dateVal))
            {
                return;
            }

            string dayVal = txtDay.Text.Trim();
            if (string.IsNullOrEmpty(dayVal))
            {
                string[] days =
                {
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                };
                dayVal = days[(int)dateVal.DayOfWeek];
            }

            decimal payment = 0;
            decimal.TryParse(txtPayment.Text.Trim(), out payment);

            decimal balance = GetOutstandingBalanceBeforeNewEntry();
            decimal total = payment + balance;

            txtBalance.Text = balance.ToString("0.00");
            txtTotal.Text = total.ToString("0.00");

            string mode = txtMode.Text.Trim();
            string paid = txtPaid.Text.Trim().ToUpper();

            using (SqlConnection con = new SqlConnection(connStr))
            {
                string insertSql = "INSERT INTO " + tableName + " " +
                                   "([DATE], [DAY], [PAYMENT], [BALANCE], [TOTAL], [MODE OF PAYMENT], [PAID]) " +
                                   "VALUES (@DATE, @DAY, @PAYMENT, @BALANCE, @TOTAL, @MODE, @PAID)";

                using (SqlCommand cmd = new SqlCommand(insertSql, con))
                {
                    cmd.Parameters.AddWithValue("@DATE", dateVal);
                    cmd.Parameters.AddWithValue("@DAY", dayVal);
                    cmd.Parameters.AddWithValue("@PAYMENT", payment);
                    cmd.Parameters.AddWithValue("@BALANCE", balance);
                    cmd.Parameters.AddWithValue("@TOTAL", total);
                    cmd.Parameters.AddWithValue("@MODE", mode);
                    cmd.Parameters.AddWithValue("@PAID", paid);

                    con.Open();
                    cmd.ExecuteNonQuery();
                }
            }

            RecalculateBalances();
            ClearFields();
        }

        protected void btnUpdate_Click(object sender, EventArgs e)
        {
            string tableName = GetTableName();

            DateTime dateVal;
            if (!DateTime.TryParse(txtDate.Text.Trim(), out dateVal))
            {
                return;
            }

            string dayVal = txtDay.Text.Trim();
            decimal payment = 0;
            decimal.TryParse(txtPayment.Text.Trim(), out payment);
            string mode = txtMode.Text.Trim();
            string paid = txtPaid.Text.Trim().ToUpper();

            using (SqlConnection con = new SqlConnection(connStr))
            {
                string updateSql = "UPDATE " + tableName + " " +
                                   "SET [DAY] = @DAY, " +
                                   "[PAYMENT] = @PAYMENT, " +
                                   "[MODE OF PAYMENT] = @MODE, " +
                                   "[PAID] = @PAID " +
                                   "WHERE [DATE] = @DATE";

                using (SqlCommand cmd = new SqlCommand(updateSql, con))
                {
                    cmd.Parameters.AddWithValue("@DAY", dayVal);
                    cmd.Parameters.AddWithValue("@PAYMENT", payment);
                    cmd.Parameters.AddWithValue("@MODE", mode);
                    cmd.Parameters.AddWithValue("@PAID", paid);
                    cmd.Parameters.AddWithValue("@DATE", dateVal);

                    con.Open();
                    cmd.ExecuteNonQuery();
                }
            }

            RecalculateBalances();
            ClearFields();
        }

        protected void btnDelete_Click(object sender, EventArgs e)
        {
            string tableName = GetTableName();

            DateTime dateVal;
            if (!DateTime.TryParse(txtDate.Text.Trim(), out dateVal))
            {
                return;
            }

            using (SqlConnection con = new SqlConnection(connStr))
            {
                string deleteSql = "DELETE FROM " + tableName + " WHERE [DATE] = @DATE";

                using (SqlCommand cmd = new SqlCommand(deleteSql, con))
                {
                    cmd.Parameters.AddWithValue("@DATE", dateVal);

                    con.Open();
                    int rows = cmd.ExecuteNonQuery();
                    if (rows > 0)
                    {
                        RecalculateBalances();
                        ClearFields();
                    }
                }
            }
        }

        protected void btnClear_Click(object sender, EventArgs e)
        {
            ClearFields();
        }

        protected void btnBack_Click(object sender, EventArgs e)
        {
            Response.Redirect("rentallpage.aspx");
        }

        protected void gvRent_SelectedIndexChanged(object sender, EventArgs e)
        {
            var row = gvRent.SelectedRow;
            if (row != null)
            {
                txtDate.Text = row.Cells[1].Text.Trim();
                txtDay.Text = row.Cells[2].Text.Trim();
                txtPayment.Text = row.Cells[3].Text.Trim();
                txtBalance.Text = row.Cells[4].Text.Trim();
                txtTotal.Text = row.Cells[5].Text.Trim();
                txtMode.Text = row.Cells[6].Text.Trim();
                txtPaid.Text = row.Cells[7].Text.Trim();

                DateTime dt;
                if (DateTime.TryParse(txtDate.Text.Trim(), out dt))
                {
                    string[] days =
                    {
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday"
                    };

                    txtDay.Text = days[(int)dt.DayOfWeek];
                }
            }
        }

        private void ClearFields()
        {
            txtDate.Text = "";
            txtDay.Text = "";
            txtPayment.Text = "";
            txtBalance.Text = "";
            txtTotal.Text = "";
            txtMode.Text = "";
            txtPaid.Text = "";
        }
    }
}`;

export const waterEditAspx = `<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="wateredit.aspx.cs" Inherits="R_WApp.wateredit" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Tenant Hub - Water Bill Management</title>
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
            max-width: 1100px;
            margin: 0 auto;
            background: rgba(8, 41, 84, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
            padding: 28px;
            backdrop-filter: blur(10px);
        }
        h2 { text-align: center; margin-bottom: 20px; font-weight: 700; letter-spacing: 1px; }
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
            background: rgba(255,255,255,0.06);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.12);
        }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { font-size: 13px; font-weight: 600; color: #b0c7e2; margin-bottom: 6px; }
        .input-control {
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #ffffff;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 14px;
            outline: none;
        }
        .input-control:focus { border-color: #60a5fa; background: rgba(255, 255, 255, 0.18); }
        .input-control option { background-color: #0b3a78; color: #ffffff; }
        .button-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
        .btn-hub {
            background: linear-gradient(135deg, #1b62bf, #0f438a);
            color: #ffffff;
            font-weight: 600;
            border-radius: 9999px;
            padding: 9px 24px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
        }
        .btn-hub:hover { background: linear-gradient(135deg, #2475e2, #1456b3); transform: translateY(-2px); }
        .btn-danger { background: linear-gradient(135deg, #c62828, #8e0000); }
        .btn-danger:hover { background: linear-gradient(135deg, #d32f2f, #b71c1c); }
        .gridview-container { overflow-x: auto; margin-top: 20px; }
        .hub-grid { width: 100%; border-collapse: collapse; font-size: 13px; }
        .hub-grid th { background: rgba(27, 98, 191, 0.7); color: #fff; padding: 10px; text-align: left; border: 1px solid rgba(255,255,255,0.15); }
        .hub-grid td { padding: 9px 10px; border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; }
        .hub-grid tr:nth-child(even) { background: rgba(255,255,255,0.04); }
        .msg-label { display: block; text-align: center; margin-bottom: 14px; font-weight: 600; }
    </style>
</head>
<body>
    <svg id="droplets" class="droplets" xmlns="http://www.w3.org/2000/svg"></svg>
    <form id="form1" runat="server">
        <div class="container">
            <h2>WATER BILL MANAGEMENT (ADMIN)</h2>
            <asp:Label ID="lblMessage" runat="server" CssClass="msg-label" ForeColor="#4ade80"></asp:Label>

            <div class="form-grid">
                <div class="form-group">
                    <label>Select Tenant Table:</label>
                    <asp:DropDownList ID="ddlTenant" runat="server" CssClass="input-control" AutoPostBack="true" OnSelectedIndexChanged="ddlTenant_SelectedIndexChanged">
                        <asp:ListItem Value="11" Text="Tenant 11 (Water_11)"></asp:ListItem>
                        <asp:ListItem Value="12" Text="Tenant 12 (Water_12)"></asp:ListItem>
                        <asp:ListItem Value="21" Text="Tenant 21 (Water_21)"></asp:ListItem>
                        <asp:ListItem Value="22" Text="Tenant 22 (Water_22)"></asp:ListItem>
                        <asp:ListItem Value="31" Text="Tenant 31 (Water_31)"></asp:ListItem>
                        <asp:ListItem Value="32" Text="Tenant 32 (Water_32)"></asp:ListItem>
                        <asp:ListItem Value="41" Text="Tenant 41 (Water_41)"></asp:ListItem>
                    </asp:DropDownList>
                </div>
                <div class="form-group">
                    <label>DATE:</label>
                    <asp:TextBox ID="txtDate" runat="server" CssClass="input-control" TextMode="Date"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label>DAY:</label>
                    <asp:TextBox ID="txtDay" runat="server" CssClass="input-control" placeholder="e.g. Monday"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label>CURRENT READINGS:</label>
                    <asp:TextBox ID="txtCurrentReadings" runat="server" CssClass="input-control" placeholder="0"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label>PREVIOUS READINGS:</label>
                    <asp:TextBox ID="txtPreviousReadings" runat="server" CssClass="input-control" placeholder="0"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label>KITCHEN (₹):</label>
                    <asp:TextBox ID="txtKitchen" runat="server" CssClass="input-control" placeholder="0.00"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label>TOTAL BILL (₹):</label>
                    <asp:TextBox ID="txtTotalBill" runat="server" CssClass="input-control" placeholder="0.00"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label>BALANCE (₹):</label>
                    <asp:TextBox ID="txtBalance" runat="server" CssClass="input-control" placeholder="0.00"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label>TOTAL (₹):</label>
                    <asp:TextBox ID="txtTotal" runat="server" CssClass="input-control" placeholder="0.00"></asp:TextBox>
                </div>
                <div class="form-group">
                    <label>PAID STATUS:</label>
                    <asp:TextBox ID="txtPaid" runat="server" CssClass="input-control" placeholder="PAID or NOT PAID"></asp:TextBox>
                </div>
            </div>

            <div class="button-row">
                <asp:Button ID="btnInsert" runat="server" Text="Insert Record" CssClass="btn-hub" OnClick="btnInsert_Click" />
                <asp:Button ID="btnUpdate" runat="server" Text="Update Record" CssClass="btn-hub" OnClick="btnUpdate_Click" />
                <asp:Button ID="btnDelete" runat="server" Text="Delete Record" CssClass="btn-hub btn-danger" OnClick="btnDelete_Click" />
                <asp:Button ID="btnClear" runat="server" Text="Clear" CssClass="btn-hub" OnClick="btnClear_Click" />
                <asp:Button ID="btnBack" runat="server" Text="Back to Admin" CssClass="btn-hub" OnClick="btnBack_Click" />
            </div>

            <div class="gridview-container">
                <asp:GridView ID="gvWater" runat="server" CssClass="hub-grid" AutoGenerateColumns="False" 
                              DataKeyNames="DATE" OnSelectedIndexChanged="gvWater_SelectedIndexChanged">
                    <Columns>
                        <asp:CommandField ShowSelectButton="True" SelectText="Select" />
                        <asp:BoundField DataField="DATE" HeaderText="DATE" DataFormatString="{0:yyyy-MM-dd}" />
                        <asp:BoundField DataField="DAY" HeaderText="DAY" />
                        <asp:BoundField DataField="CURRENT_READINGS" HeaderText="CURRENT" />
                        <asp:BoundField DataField="PREVIOUS_READINGS" HeaderText="PREVIOUS" />
                        <asp:BoundField DataField="KITCHEN" HeaderText="KITCHEN" DataFormatString="{0:F2}" />
                        <asp:BoundField DataField="TOTAL_BILL" HeaderText="BILL" DataFormatString="{0:F2}" />
                        <asp:BoundField DataField="BALANCE" HeaderText="BALANCE" DataFormatString="{0:F2}" />
                        <asp:BoundField DataField="TOTAL" HeaderText="TOTAL" DataFormatString="{0:F2}" />
                        <asp:BoundField DataField="PAID" HeaderText="PAID" />
                    </Columns>
                </asp:GridView>
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

export const waterEditCs = `using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace R_WApp
{
    public partial class wateredit : Page
    {
        private class TenantTableInfo
        {
            public string RentTable { get; set; }
            public string WaterTable { get; set; }
        }

        private TenantTableInfo GetTenantTables(string tenantNumber)
        {
            Dictionary<string, TenantTableInfo> tableMap =
                new Dictionary<string, TenantTableInfo>(StringComparer.OrdinalIgnoreCase)
            {
                { "11", new TenantTableInfo { RentTable = "RENT_11", WaterTable = "Water_11" } },
                { "12", new TenantTableInfo { RentTable = "RENT_12", WaterTable = "Water_12" } },
                { "21", new TenantTableInfo { RentTable = "RENT_21", WaterTable = "Water_21" } },
                { "22", new TenantTableInfo { RentTable = "RENT_22", WaterTable = "Water_22" } },
                { "31", new TenantTableInfo { RentTable = "RENT_31", WaterTable = "Water_31" } },
                { "32", new TenantTableInfo { RentTable = "RENT_32", WaterTable = "Water_32" } },
                { "41", new TenantTableInfo { RentTable = "RENT_41", WaterTable = "Water_41" } }
            };

            if (!tableMap.ContainsKey(tenantNumber))
            {
                throw new Exception("Invalid tenant number.");
            }

            return tableMap[tenantNumber];
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

                txtDate.Text = DateTime.Now.ToString("yyyy-MM-dd");
                txtDay.Text = DateTime.Now.DayOfWeek.ToString();
                LoadGrid();
            }
        }

        private void LoadGrid()
        {
            try
            {
                string tenantNum = ddlTenant.SelectedValue;
                TenantTableInfo info = GetTenantTables(tenantNum);
                string connStr = ConfigurationManager.ConnectionStrings["R_WAPP"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    string sql = "SELECT [DATE], [DAY], [CURRENT_READINGS], [PREVIOUS_READINGS], [KITCHEN], " +
                                 "[TOTAL_BILL], [BALANCE], [TOTAL], [PAID] FROM [" + info.WaterTable + "] ORDER BY [DATE] DESC";

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                        {
                            DataTable dt = new DataTable();
                            da.Fill(dt);
                            gvWater.DataSource = dt;
                            gvWater.DataBind();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                lblMessage.Text = "Error loading water records: " + ex.Message;
                lblMessage.ForeColor = System.Drawing.Color.OrangeRed;
            }
        }

        protected void ddlTenant_SelectedIndexChanged(object sender, EventArgs e)
        {
            LoadGrid();
            ClearForm();
        }

        protected void btnInsert_Click(object sender, EventArgs e)
        {
            try
            {
                string tenantNum = ddlTenant.SelectedValue;
                TenantTableInfo info = GetTenantTables(tenantNum);
                string connStr = ConfigurationManager.ConnectionStrings["R_WAPP"].ConnectionString;

                int currentReadings = 0;
                int previousReadings = 0;
                decimal kitchen = 0m;
                decimal totalBill = 0m;
                decimal balance = 0m;
                decimal total = 0m;

                int.TryParse(txtCurrentReadings.Text.Trim(), out currentReadings);
                int.TryParse(txtPreviousReadings.Text.Trim(), out previousReadings);
                decimal.TryParse(txtKitchen.Text.Trim(), out kitchen);
                decimal.TryParse(txtTotalBill.Text.Trim(), out totalBill);
                decimal.TryParse(txtBalance.Text.Trim(), out balance);
                decimal.TryParse(txtTotal.Text.Trim(), out total);

                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    conn.Open();
                    string insertSql = "INSERT INTO [" + info.WaterTable + "] " +
                                       "([DATE], [DAY], [CURRENT_READINGS], [PREVIOUS_READINGS], [KITCHEN], [TOTAL_BILL], [BALANCE], [TOTAL], [PAID]) " +
                                       "VALUES (@DATE, @DAY, @CURRENT_READINGS, @PREVIOUS_READINGS, @KITCHEN, @TOTAL_BILL, @BALANCE, @TOTAL, @PAID)";

                    using (SqlCommand cmd = new SqlCommand(insertSql, conn))
                    {
                        cmd.Parameters.Add("@DATE", SqlDbType.Date).Value = DateTime.Parse(txtDate.Text.Trim());
                        cmd.Parameters.Add("@DAY", SqlDbType.VarChar, 50).Value = txtDay.Text.Trim();
                        cmd.Parameters.Add("@CURRENT_READINGS", SqlDbType.Int).Value = currentReadings;
                        cmd.Parameters.Add("@PREVIOUS_READINGS", SqlDbType.Int).Value = previousReadings;
                        cmd.Parameters.Add("@KITCHEN", SqlDbType.Decimal).Value = kitchen;
                        cmd.Parameters.Add("@TOTAL_BILL", SqlDbType.Decimal).Value = totalBill;
                        cmd.Parameters.Add("@BALANCE", SqlDbType.Decimal).Value = balance;
                        cmd.Parameters.Add("@TOTAL", SqlDbType.Decimal).Value = total;
                        cmd.Parameters.Add("@PAID", SqlDbType.VarChar, 50).Value = txtPaid.Text.Trim();

                        cmd.ExecuteNonQuery();
                    }
                }

                lblMessage.Text = "Water bill record inserted successfully!";
                lblMessage.ForeColor = System.Drawing.Color.LightGreen;
                LoadGrid();
                ClearForm();
            }
            catch (Exception ex)
            {
                lblMessage.Text = "Insert failed: " + ex.Message;
                lblMessage.ForeColor = System.Drawing.Color.OrangeRed;
            }
        }

        protected void btnUpdate_Click(object sender, EventArgs e)
        {
            try
            {
                string tenantNum = ddlTenant.SelectedValue;
                TenantTableInfo info = GetTenantTables(tenantNum);
                string connStr = ConfigurationManager.ConnectionStrings["R_WAPP"].ConnectionString;

                int currentReadings = 0;
                int previousReadings = 0;
                decimal kitchen = 0m;
                decimal totalBill = 0m;
                decimal balance = 0m;
                decimal total = 0m;

                int.TryParse(txtCurrentReadings.Text.Trim(), out currentReadings);
                int.TryParse(txtPreviousReadings.Text.Trim(), out previousReadings);
                decimal.TryParse(txtKitchen.Text.Trim(), out kitchen);
                decimal.TryParse(txtTotalBill.Text.Trim(), out totalBill);
                decimal.TryParse(txtBalance.Text.Trim(), out balance);
                decimal.TryParse(txtTotal.Text.Trim(), out total);

                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    conn.Open();
                    string updateSql = "UPDATE [" + info.WaterTable + "] SET " +
                                       "[DAY] = @DAY, " +
                                       "[CURRENT_READINGS] = @CURRENT_READINGS, " +
                                       "[PREVIOUS_READINGS] = @PREVIOUS_READINGS, " +
                                       "[KITCHEN] = @KITCHEN, " +
                                       "[TOTAL_BILL] = @TOTAL_BILL, " +
                                       "[BALANCE] = @BALANCE, " +
                                       "[TOTAL] = @TOTAL, " +
                                       "[PAID] = @PAID " +
                                       "WHERE [DATE] = @DATE";

                    using (SqlCommand cmd = new SqlCommand(updateSql, conn))
                    {
                        cmd.Parameters.Add("@DATE", SqlDbType.Date).Value = DateTime.Parse(txtDate.Text.Trim());
                        cmd.Parameters.Add("@DAY", SqlDbType.VarChar, 50).Value = txtDay.Text.Trim();
                        cmd.Parameters.Add("@CURRENT_READINGS", SqlDbType.Int).Value = currentReadings;
                        cmd.Parameters.Add("@PREVIOUS_READINGS", SqlDbType.Int).Value = previousReadings;
                        cmd.Parameters.Add("@KITCHEN", SqlDbType.Decimal).Value = kitchen;
                        cmd.Parameters.Add("@TOTAL_BILL", SqlDbType.Decimal).Value = totalBill;
                        cmd.Parameters.Add("@BALANCE", SqlDbType.Decimal).Value = balance;
                        cmd.Parameters.Add("@TOTAL", SqlDbType.Decimal).Value = total;
                        cmd.Parameters.Add("@PAID", SqlDbType.VarChar, 50).Value = txtPaid.Text.Trim();

                        int rows = cmd.ExecuteNonQuery();
                        if (rows > 0)
                        {
                            lblMessage.Text = "Water record updated successfully!";
                            lblMessage.ForeColor = System.Drawing.Color.LightGreen;
                        }
                    }
                }

                LoadGrid();
            }
            catch (Exception ex)
            {
                lblMessage.Text = "Update failed: " + ex.Message;
                lblMessage.ForeColor = System.Drawing.Color.OrangeRed;
            }
        }

        protected void btnDelete_Click(object sender, EventArgs e)
        {
            try
            {
                string tenantNum = ddlTenant.SelectedValue;
                TenantTableInfo info = GetTenantTables(tenantNum);
                string connStr = ConfigurationManager.ConnectionStrings["R_WAPP"].ConnectionString;

                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    conn.Open();
                    string deleteSql = "DELETE FROM [" + info.WaterTable + "] WHERE [DATE] = @DATE";
                    using (SqlCommand cmd = new SqlCommand(deleteSql, conn))
                    {
                        cmd.Parameters.Add("@DATE", SqlDbType.Date).Value = DateTime.Parse(txtDate.Text.Trim());
                        cmd.ExecuteNonQuery();
                        lblMessage.Text = "Water record deleted successfully!";
                        lblMessage.ForeColor = System.Drawing.Color.LightGreen;
                    }
                }

                LoadGrid();
                ClearForm();
            }
            catch (Exception ex)
            {
                lblMessage.Text = "Delete failed: " + ex.Message;
                lblMessage.ForeColor = System.Drawing.Color.OrangeRed;
            }
        }

        protected void gvWater_SelectedIndexChanged(object sender, EventArgs e)
        {
            GridViewRow row = gvWater.SelectedRow;
            if (row != null)
            {
                txtDate.Text = row.Cells[1].Text;
                txtDay.Text = row.Cells[2].Text;
                txtCurrentReadings.Text = row.Cells[3].Text;
                txtPreviousReadings.Text = row.Cells[4].Text;
                txtKitchen.Text = row.Cells[5].Text;
                txtTotalBill.Text = row.Cells[6].Text;
                txtBalance.Text = row.Cells[7].Text;
                txtTotal.Text = row.Cells[8].Text;
                txtPaid.Text = row.Cells[9].Text;
            }
        }

        protected void btnClear_Click(object sender, EventArgs e)
        {
            ClearForm();
        }

        private void ClearForm()
        {
            txtDate.Text = DateTime.Now.ToString("yyyy-MM-dd");
            txtDay.Text = DateTime.Now.DayOfWeek.ToString();
            txtCurrentReadings.Text = "";
            txtPreviousReadings.Text = "";
            txtKitchen.Text = "";
            txtTotalBill.Text = "";
            txtBalance.Text = "";
            txtTotal.Text = "";
            txtPaid.Text = "";
        }

        protected void btnBack_Click(object sender, EventArgs e)
        {
            Response.Redirect("adminmainpage.aspx");
        }
    }
}`;
