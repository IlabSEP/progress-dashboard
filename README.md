# progress-dashboard

Welcome to the [SEP](https://www.ntu.edu.sg/i-lab/research-focus/student-entrepreneurship-program-\(sep\)) Tracker github repository! I will try my best to explain how everything works here, so that you can pick up and continue maintaining it.  

### Quick links to deployments
dev deployment: https://progress-dashboard-dev.pages.dev  
prod deployment: https://ilabsep.github.io/progress-dashboard/  

### Services used:
- [Clerk](https://clerk.com) (Auth & Email OTP Provider)
- [Convex](https://convex.dev) (Database & Backend Compute Provider)
- [Cloudflare](https://cloudflare.com) (dev deployment host, since github pages only allows for one deployment)
- Github Pages (obviously)

All of these services are signed in using "Sign in with Github" using [iLabSEP](https://github.com/IlabSEP)'s account, so do get login credentials from whoever is in charge of iLab (at the time of writing it is [Jian Xin](mailto:jianxin.lim@ntu.edu.sg) and [Mr Teo](mailto:ASCETEO@ntu.edu.sg), please update this if there are changes)
> I reccomend using another [browser](https://zen-browser.app/) that stays logged into SEP related accounts, and use that for everything  

### Requirements
Check that you have the following files:
```
.env.development
.env.production
```
