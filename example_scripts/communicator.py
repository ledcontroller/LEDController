import urllib.request
import json      

def setupController(controller_url, secret, ups):
  # ask for stats (not yet implementet)
  return sendCommand(controller_url + "api/start", {"token": secret, "update_per_second": ups})


def sendCommand(url, data):
  print("Sending command: ", url)
  req = urllib.request.Request(url)
  req.add_header('Content-Type', 'application/json; charset=utf-8')
  jsondata = json.dumps(data)
  jsondataasbytes = jsondata.encode('utf-8')   # needs to be bytes
  req.add_header('Content-Length', len(jsondataasbytes))
  print (jsondataasbytes)
  return urllib.request.urlopen(req, jsondataasbytes)