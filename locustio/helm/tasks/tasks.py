import resource
import uuid
import json
import random

from locust import HttpLocust, TaskSet, task, TaskSequence, seq_task

usersService = "https://exyo8ltd82.execute-api.us-east-1.amazonaws.com/dev"
orderService = "https://tpbvo967n5.execute-api.us-east-1.amazonaws.com/dev"
stockService = "https://2lquq57a6b.execute-api.us-east-1.amazonaws.com/dev"
sagasService = "https://930ku1x7kb.execute-api.us-east-1.amazonaws.com/dev"
paymentService = "https://szf0nvhjb4.execute-api.us-east-1.amazonaws.com/dev"

# resource.setrlimit(resource.RLIMIT_STACK, (resource.RLIM_INFINITY, resource.RLIM_INFINITY))

class ElbTasks(TaskSet):

  # @task(100) indicates that 100% of the time, pay function is called, later this can be divided with other functions
  @task(100)
  def index(self):
    order_id = str(uuid.uuid4())
    user_id = 1
    self.client.post(f"{paymentService}/payment/pay/{user_id}/{order_id}", name="Pay")

class tasks(TaskSet):

  @task(40)
  class completeCheckout(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"{usersService}/users/create", name="CreateUser")
      print("Create account:")
      print("user_id: " + response.json()['user_id'])
      self.UserID = response.json()['user_id']

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"{sagasService}/orders/create/{self.UserID}", name="CreateOrder")
      if response.ok:
        self.OrderID = response.json()['order_id']
        print("order_id: " + self.OrderID)

    @seq_task(3)
    def create_item(self):
      response = self.client.post(f"{stockService}/stock/item/create", name="CreateItem")
      print("item_id: " + response.json()['item_id'])
      self.ItemID = response.json()['item_id']

    @seq_task(4)
    def add_stock(self):
      self.InitialStock = random.randint(1,11)
      self.client.post(f"{stockService}/stock/add/{self.ItemID}/{self.InitialStock}", name="AddStock")

    @seq_task(5)
    def add_item_to_order(self):
      for i in range(random.randint(1, self.InitialStock)):
        self.client.post(f"{sagasService}/orders/addItem/{self.OrderID}/{self.ItemID}", name="AddItemToOrder")

    @seq_task(6)
    def add_credit(self):
      self.client.post(f"{usersService}/users/credit/add/{self.UserID}/{self.InitialStock}", name="AddCreditToUser")

    @seq_task(7)
    def checkout(self):
      self.client.post(f"{sagasService}/orders/checkout/{self.OrderID}", name="Checkout")

    @seq_task(7)
    def find_order(self):
      response = self.client.get(f"{sagasService}/orders/find/{self.OrderID}", name="FindOrder")
      #print("isPaid: " + str(response.json()['isPaid']))
      self.interrupt()

  @task(20)
  class removeOrder(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"{usersService}/users/create", name="CreateUser")
      print("Create account:")
      print("user_id: " + response.json()['user_id'])
      self.UserID = response.json()['user_id']

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"{sagasService}/orders/create/{self.UserID}", name="CreateOrder")
      if response.ok:
        self.OrderID = response.json()['order_id']
        print("order_id: " + self.OrderID)

    @seq_task(3)
    def create_item(self):
      response = self.client.post(f"{stockService}/stock/item/create", name="CreateItem")
      #print("item_id: " + response.json()['item_id'])
      self.ItemID = response.json()['item_id']

    @seq_task(4)
    def add_stock(self):
      self.InitialStock = random.randint(1,11)
      self.client.post(f"{stockService}/stock/add/{self.ItemID}/{self.InitialStock}", name="AddStock")

    @seq_task(5)
    def add_item_to_order(self):
      for i in range(random.randint(1, self.InitialStock)):
        self.client.post(f"{sagasService}/orders/addItem/{self.OrderID}/{self.ItemID}", name="AddItemToOrder")

    @seq_task(7)
    def remove_order(self):
      response = self.client.delete(f"{sagasService}/orders/remove/{self.OrderID}", name="Remove Order")
      self.interrupt()

  @task(20)
  class justLooking(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"{usersService}/users/create", name="CreateUser")
      self.UserID = response.json()['user_id']

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"{sagasService}/orders/create/{self.UserID}", name="CreateOrder")
      self.OrderID = response.json()['order_id']

    @seq_task(3)
    def create_item(self):
      response = self.client.post(f"{stockService}/stock/item/create/", name="CreateItem")
      self.ItemID = response.json()['item_id']

    @seq_task(4)
    def add_stock(self):
      self.InitialStock = random.randint(1,11)
      self.client.post(f"{stockService}/stock/add/{self.ItemID}/{self.InitialStock}", name="AddStock")

    @seq_task(5)
    def add_item_to_order(self):
      for i in range(random.randint(1, self.InitialStock)):
        self.client.post(f"{sagasService}/orders/addItem/{self.OrderID}/{self.ItemID}", name="AddItemToOrder")

  @task(10)
  class noStockTask(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"{usersService}/users/create", name="CreateUser")
      self.UserID = response.json()['user_id']

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"{sagasService}/orders/create/{self.UserID}", name="CreateOrder")
      self.OrderID = response.json()['order_id']

    @seq_task(3)
    def create_item(self):
      response = self.client.post(f"{stockService}/stock/item/create/", name="CreateItem")
      self.ItemID = response.json()['item_id']

    @seq_task(4)
    def add_item_to_order(self):
      with self.client.post(f"{sagasService}/orders/addItem/{self.OrderID}/{self.ItemID}",
                            catch_response=True, name="FailedAddItemToOrder") as response:
        if response.status_code != 200:
          response.success()
      self.interrupt()

  @task(10)
  class noCreditTask(TaskSequence):
    @seq_task(1)
    def create_account(self):
      response = self.client.post(f"{usersService}/users/create", name="CreateUser")
      self.UserID = response.json()['user_id']

    @seq_task(2)
    def create_order(self):
      response = self.client.post(f"{sagasService}/orders/create/{self.UserID}", name="CreateOrder")
      self.OrderID = response.json()['order_id']

    @seq_task(3)
    def create_item(self):
      response = self.client.post(f"{stockService}/stock/item/create/", name="CreateItem")
      self.ItemID = response.json()['item_id']

    @seq_task(4)
    def add_stock(self):
      self.InitialStock = random.randint(1,11)
      self.client.post(f"{stockService}/stock/add/{self.ItemID}/{self.InitialStock}", name="AddStock")

    @seq_task(5)
    def add_item_to_order(self):
      for i in range(random.randint(1, self.InitialStock)):
        self.client.post(f"{sagasService}/orders/addItem/{self.OrderID}/{self.ItemID}", name="AddItemToOrder")

    @seq_task(6)
    def checkout(self):
      with self.client.post(f"{sagasService}/orders/checkout/{self.OrderID}", catch_response=True, name="FailedCheckout") as response:
        if response.status_code != 200:
          response.success()
      self.interrupt()

class ElbWarmer(HttpLocust):
  # Toggle task sets
  # task_set = ElbTasks
  task_set = tasks
  min_wait = 1000
  max_wait = 3000