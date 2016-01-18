
default:
	jekyll build
	git add .
	git commit
	git push origin src
	git stpp _site origin master
