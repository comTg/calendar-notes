import { useState } from 'react'
import './App.css'
import { CalendarView } from './components/calendar/calendar-view'
import { Sidebar } from './components/calendar/sidebar'
import { Menu, CalendarRange } from 'lucide-react'
import { Button } from './components/ui/button'
import { Toaster } from './components/ui/toaster'

function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="App">
      <header className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-2">
          <CalendarRange className="h-6 w-6" />
          <h1 className="text-xl font-bold">日历笔记</h1>
        </div>
        <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      <main className="container mx-auto px-4 py-6">
        <CalendarView onSelectDate={setSelectedDate} />
      </main>

      <Sidebar 
        selectedDate={selectedDate} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <Toaster />
    </div>
  )
}

export default App