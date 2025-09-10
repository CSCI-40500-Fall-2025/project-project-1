[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/_KG6YNPd)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=20208102)

# Bing Bong

## Product Vision
Our product is a platform for college students who want a better understanding of locations and events near their college. It will provide everything (club/campus events, study sessions, food locations, etc.)that students may want to go to within and around the college community. Unlike Google Maps and other social media platforms, our product’s content will be centered around the college, so students wouldn’t have to look through different sources (i.e emails, posters, Instagram) just to find out what’s going on. 

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
