FROM python:3.6

# Set to ensure the python buffering for stdout doesn't keep the info we want out of the logs.
ENV PYTHONUNBUFFERED 1

ADD requirements.txt /locust/requirements.txt

# Install all necessary python packages
RUN pip install -r /locust/requirements.txt

# Copy the tasks
COPY ./helm/tasks/tasks.py /locust/locustfile.py
COPY ./run.sh /locust/run.sh

# Expose the required Locust ports
EXPOSE 5557 5558 8089

# Set script to be executable
RUN chmod 755 /locust/run.sh

CMD /locust/run.sh
