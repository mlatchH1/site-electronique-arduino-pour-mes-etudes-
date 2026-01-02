@echo off
cd /d "c:\Users\m.levarlet\Desktop\site-electronique-arduino-pour-mes-etudes-"
git add .
git commit -m "Sauvegarde automatique - %date% %time%"
git push origin main
echo Sauvegarde terminee.
exit