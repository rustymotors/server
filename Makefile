init:
	pip install --user pdm
	pdm install

lint:
	pdm run flake8 . --exit-zero

format:
	pdm run black .

setcap:
	@sudo setcap cap_net_bind_service=+ep $$(readlink -f $$(pdm run which python))


test:
	pdm run coverage run -m pytest
	pdm run coverage report -m --skip-covered
	pdm run coverage xml

.PHONY: init lint test
