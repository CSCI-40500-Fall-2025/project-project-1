[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/_KG6YNPd)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=20208102)

# Bing Bong

Figma Prototype: https://www.figma.com/design/uYJhX81BXaZXSea7oK4Wjr/SWE-Proj?node-id=0-1&t=lr60PfD8MiXTsyvA-1

## Product Vision
Our product is a platform designed to make organizing friend hangouts simple and stress-free. Rather than endless group chats and scheduling conflicts, users can instantly see when their friends are available. The platform lets people mark their free times, thus creating a shared availability view for the entire group. Built-in reminders and smart suggestions makes planning hangouts effortless so friends can spend less time coordinating and more time actually hanging out.

In addition, users can manage multiple friend groups in one place, making it easy to plan separately with different circles of friends and avoid double-booking conflicts.

## Frontend
Navigate to the frontend folder:
   ```bash
	cd front-end

	# Install dependencies:
	npm install

	# Start the development server:
	npm run dev
```
App runs at:  [http://localhost:5173](http://localhost:5173)

## Backend
```bash
	cd back-end

	# Install dependencies:
	npm install


	node server.js
```

Server runs at: http://localhost:3000

## Deployment:
In front-end:
```bash
	npm run build
 ```

In root:
```bash
	firebase init hosting
	firebase deploy --only hosting
```

For Firebase init:
✔ What do you want to use as your public directory? front-end
✔ Configure as a single-page app (rewrite all urls to /index.html)? Yes
✔ Set up automatic builds and deploys with GitHub? No
