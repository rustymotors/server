init:
	pip install --user pdm
	pdm sync -d -G testing

lint:
	pipenv run flake8 . --exit-zero

format:
	pipenv run black .


test:
	pdm run coverage run -m pytest
	pdm run coverage report -m --skip-covered
	pdm run coverage xml

.PHONY: init lint test
