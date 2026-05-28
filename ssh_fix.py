import paramiko

host = "89.117.79.191"
password = "S3Nh000054326"

users = ["root", "deployer", "ubuntu", "admin"]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

connected = False
for user in users:
    try:
        print(f"Trying to connect with {user}...")
        client.connect(host, username=user, password=password, timeout=10)
        print(f"Connected successfully with {user}!")
        connected = True
        break
    except paramiko.AuthenticationException:
        print(f"Authentication failed for {user}.")
    except Exception as e:
        print(f"Error for {user}: {e}")

if connected:
    try:
        commands = [
            "systemctl status nginx --no-pager",
            "sudo systemctl start nginx",
            "sudo systemctl status nginx --no-pager",
            "pm2 status",
            "sudo pm2 status",
            "sudo systemctl status docker --no-pager",
            "ls -la /var/www/wandeath.com"
        ]
        
        for cmd in commands:
            print(f"--- Running: {cmd} ---")
            stdin, stdout, stderr = client.exec_command(cmd)
            out = stdout.read().decode('utf-8')
            err = stderr.read().decode('utf-8')
            if out: print("STDOUT:\n" + out)
            if err: print("STDERR:\n" + err)
            
    except Exception as e:
        print("Error during commands:", e)
    finally:
        client.close()
