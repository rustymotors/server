import tkinter as tk


class RustyMotorsServer(tk.Frame):
    def __init__(
        self,
        master=None,
    ):
        tk.Frame.__init__(self, master)
        self.grid()
        tk.Label(self, text="Hello World!").grid(column=0, row=0)
        tk.Button(self, text="Quit", command=self.quit).grid(column=1, row=0)

    def run(self):
        self.mainloop()
