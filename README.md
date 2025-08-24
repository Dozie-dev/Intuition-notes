#  Trust Notes dApp - Valeria's Notes 
# 👉 **[Live Project Link](https://valerias-trust-notes.vercel.app/)**  -Click Link

**Trust Notes** is a simple decentralized notes application built with **Next.js** and deployable on **Vercel**.  
It integrates with the **Intuition Wallet** and uses the **$TTRUST token** as a gating mechanism.  

Users must hold a minimum balance of $TTRUST tokens in their wallet to create notes, ensuring that every piece of information carries weight and accountability. In future versions, notes can also be staked with $TRUST to increase their visibility and reputation on-chain.  

---

##  Features
-  **Wallet Connect** – Sign in with your Intuition (EVM-compatible) wallet.  
-  **Token-Gated Access** – Only users holding $TTRUST can create notes.  
-  **Notes App** – Create, edit, and delete personal notes.  
-  **Blockchain Integration** – $TTRUST balance check + placeholder smart contract call for staking.  
-  **Deployable on Vercel** – Lightweight, serverless-friendly.  

---

##  How to Use
1. Connect your Intuition Wallet using the **Connect Wallet** button.  
2. The app checks your $TTRUST balance.  
   - If you meet the minimum, you can create notes.  
   - If not, you’ll be prompted to acquire more $TRUST.  
3. Add new notes using the **+** button.  
4. Your notes are stored locally (future support for Supabase/IPFS coming).  

---

##  Roadmap
-  Token balance check for $TTRUST  
-  On-chain staking for note creation  
-  Social curation (endorse or challenge notes)  
-  Reputation badges & NFT-based proof of authorship  

---

##  Deployment
- Clone this repo  
- Install dependencies  
  ```bash
  npm install
