# Make Automation Projects

![Make.com](https://img.shields.io/badge/Make.com-Automation-blue?logo=make) ![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-Backend-yellow?logo=google) ![Slack](https://img.shields.io/badge/Slack-Integration-4A154B?logo=slack) ![Zoho](https://img.shields.io/badge/Zoho-Integration-FF4A00?logo=zoho) ![RapidAPI](https://img.shields.io/badge/RapidAPI-Integration-0096D6?logo=rapidapi)

---

## 🚀 High-Level Overview

**Make Automation Projects** is a showcase of advanced automation scenarios built on [Make.com](https://www.make.com/), Google Apps Script, and various SaaS integrations. Developed as part of my journey as an Automation Engineer at Axelerant, these projects reflect my passion for workflow automation, prompt engineering, and seamless integration across platforms. Both bots are now decommissioned and are presented here for reference and portfolio purposes only.

---

# 🛠️ Projects

## 1. DSM Bot — Daily Status Meeting Automation

![DSM Bot Sheet](https://i.ibb.co/pBdhymWB/DSM-bot-Sheet.jpg)

### **Summary**
Automates daily status meeting (DSM) reports for teams, integrating with Timetastic (leave management), Slack (IM), Zoho (user details), and Google Sheets (task management). It posts structured DSM updates to Slack channels, streamlining daily reporting and boosting team productivity.

### **Key Features**
- **Multi-Platform Integration:** Connects Timetastic, Slack, Zoho, and Google Sheets.
- **Automated DSM Reports:** Gathers daily tasks, blockers, and accomplishments from Google Sheets and posts to Slack.
- **Leave Management:** Checks leave status via Timetastic and notifies the team accordingly.
- **User Data Sync:** Fetches and stores user details from Zoho for personalized reporting.
- **Centralized Script Updates:** Uses Google Apps Script API to check for updates in the master script/library and automatically push updates to all users' Google Sheets, ensuring everyone is on the latest version.
- **No Manual Triggers:** Fully automated via scheduled triggers and webhooks.

### **Unique Points & Technologies**
- **Google Apps Script API Automation:** Seamlessly updates all user scripts from a master library, reducing maintenance overhead and ensuring consistency across the team.
- **Make.com Scenario Orchestration:** Visual, modular automation flows for easy management and extension.

### **Screenshots**
- ![DSM Bot Make Scenario](https://i.ibb.co/xtQ7fJt6/DSM-Reply-Bot.jpg)
- ![DSM Bot Update Pusher Make Scenario](https://i.ibb.co/XZck6D7m/apps-script-updator.jpg)

---

## 2. Cricket Bot — Prediction & Engagement Automation

![Cricket Bot Sheet 1](https://i.ibb.co/q3c3LVDM/cricket-sheet-1.jpg)

### **Summary**
A fun, engagement-focused bot for company cricket events which was enabled by a bot that collects predictions from team members. The bot built by me fetches live scores, updates leaderboards for the match league, and based on historic data of the teams playing, predict and respond on my behalf. The bot integrates with Slack, Google Sheets, and external cricket APIs.

### **Key Features**
- **Live Cricket Data:** Fetches real-time scores and match data via RapidAPI (Cricbuzz).
- **Prediction Engine:** Collects and processes predictions from previous predictions of the bot.
- **Dynamic Prompt Engineering:** Generates context-aware prompts for ChatGPT using up-to-date Google Sheets data (match history, team stats, previous predictions) to make evolving, data-driven predictions.
- **Leaderboard Management:** Maintains and updates scores of the teams playing and historic match data to help with prompts of the next match.
- **Penalty System:** Adjusts bot confidence and prediction logic based on recent performance and match outcomes.

### **Unique Points & Technologies**
- **Prompt Engineering with LLMs:** Leverages dynamic, data-driven prompts for ChatGPT, showcasing advanced prompt engineering and integration skills.
- **Make.com Scenario Automation:** Modular, visual flows for prediction and response based on trigger message from event bot.

### **Screenshots**
- ![Cricket Bot Make Scenario](https://i.ibb.co/N21GTXGs/Cricket-Bot-1.jpg)

---

# 🌟 Key Technologies & Unique Features

| Project      | Key Technologies & Integrations | Unique Highlights |
|--------------|---------------------------------|-------------------|
| **DSM Bot**  | Make.com, Google Apps Script, Slack, Zoho, Timetastic | Centralized script update automation, multi-platform DSM reporting |
| **Cricket Bot** | Make.com, Google Apps Script, Slack, RapidAPI, ChatGPT | Dynamic prompt engineering, real-time cricket data, prediction history based learnings |

---

# 🖼️ Screenshots Gallery

- [DSM Bot Sheet](https://i.ibb.co/pBdhymWB/DSM-bot-Sheet.jpg)
- [DSM Bot Make Scenario](https://i.ibb.co/xtQ7fJt6/DSM-Reply-Bot.jpg)
- [DSM Bot Update Pusher Make Scenario](https://i.ibb.co/XZck6D7m/apps-script-updator.jpg)
- [Cricket Bot Make Scenario](https://i.ibb.co/N21GTXGs/Cricket-Bot-1.jpg)
- [Cricket Bot Sheet 1](https://i.ibb.co/q3c3LVDM/cricket-sheet-1.jpg)
- [Cricket Bot Sheet 2](https://i.ibb.co/3bsht45/cricket-sheet-2.jpg)

---

# 📜 License

This repository is licensed under the [MIT License](LICENSE).

---

# 🙏 Acknowledgements

Special thanks to [Michael Cannon](https://www.linkedin.com/in/immichaelcannon/) for his guidance and support in leveraging Make.com and building robust automation solutions.

---

# 📬 Contact

- **Email:** amrit.dash60@gmail.com
- **LinkedIn:** [amritdash60](https://www.linkedin.com/in/amritdash60/)
- **GitHub:** [amrit-dash](https://github.com/amrit-dash)

---

> **Note:** These projects are decommissioned and are presented for reference and portfolio purposes only. 