init:
	pip3 install -r requirements.txt

test:
	pytest --cov-config=.coveragerc --cov=. --cov-report xml --junitxml=junit.xml .

.PHONY: init test