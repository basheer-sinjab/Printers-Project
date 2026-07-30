Option Explicit

Dim shell, fileSystem, projectPath, command

Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")
projectPath = fileSystem.GetParentFolderName(WScript.ScriptFullName)

command = "cmd.exe /c cd /d """ & projectPath & """ && npm run dev -- --host 127.0.0.1 --port 8080 > ""data\printers-server.log"" 2>&1"
shell.Run command, 0, False