class SortAlgorithm:
    def __init__(self, data):
        self.data = data
        self.length = len(data)

    def bubble_sort(self):
        for i in range(self.length):
            for j in range(0, self.length - i - 1):
                if self.data[j] > self.data[j + 1]:
                    self.data[j], self.data[j + 1] = self.data[j + 1], self.data[j]
    def selection_sort(self):
        for i in range(self.length):
            min_idx = i
            for j in range(i + 1, self.length):
                if self.data[min_idx] > self.data[j]:
                    min_idx = j
            self.data[i], self.data[min_idx] = self.data[min_idx], self.data[i]
    def insertion_sort(self):
        for i in range(1, self.length):
            key = self.data[i]
            j = i - 1
            while j >= 0 and key < self.data[j]:
                self.data[j + 1] = self.data[j]
                j -= 1
            self.data[j + 1] = key
    def shell_sort(self):
        gap = self.length // 2
        while gap > 0:
            for i in range(gap, self.length):
                temp = self.data[i]
                j = i
                while j >= gap and self.data[j - gap] > temp:
                    self.data[j] = self.data[j - gap]
                    j -= gap
                self.data[j] = temp
            gap //= 2
    def merge_sort(self, l, r):
        if l >= r:
            return
        m = (l + r) // 2
        self.merge_sort(l, m)
        self.merge_sort(m + 1, r)
        self.merge(l, m, r)

    def merge(self, l, m, r):
        L = self.data[l:m + 1]
        R = self.data[m + 1:r + 1]
        i = j = 0
        k = l
        while i < len(L) and j < len(R):
            if L[i] <= R[j]:
                self.data[k] = L[i]
                i += 1
            else:
                self.data[k] = R[j]
                j += 1
            k += 1
        while i < len(L):
            self.data[k] = L[i]
            i += 1
            k += 1
        while j < len(R):
            self.data[k] = R[j]
            j += 1
            k += 1
    def quick_sort(self, l, r):
        if l >= r:
            return
        pivot = self.data[r]
        i = l - 1
        for j in range(l, r):
            if self.data[j] < pivot:
                i += 1
                self.data[i], self.data[j] = self.data[j], self.data[i]
        self.data[i + 1], self.data[r] = self.data[r], self.data[i + 1]
        pi = i + 1
        self.quick_sort(l, pi - 1)
        self.quick_sort(pi + 1, r)