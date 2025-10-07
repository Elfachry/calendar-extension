# Calendar Extension

A minimalist Chrome extension that combines a calendar view with a daily todo list, designed for simple and efficient task management.

## 🎯 Features

- **Monthly Calendar View**: Clean, intuitive calendar interface using FullCalendar
- **Daily Todo List**: Quick-access todo list for today's tasks
- **Event Management**: Create, edit, and delete calendar events
- **Persistent Storage**: All data stored locally using Chrome storage API
- **Minimalist Design**: Black and white sidebar with modern UI

## 🚀 Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the project folder

## 💻 Technologies Used

- **FullCalendar.js**: Calendar functionality
- **Vanilla JavaScript**: Core logic
- **Chrome Storage API**: Data persistence
- **CSS3**: Styling and animations
- **Lucide Icons**: UI icons

## 📂 Project Structure

```
├── calendar.html       # Main popup interface
├── calendar.js         # Core calendar and todo logic
├── calendar.css        # Styling
├── manifest.json       # Chrome extension configuration
├── background.js       # Background script
├── icons/             # Extension icons
└── index.global.min.js # FullCalendar library
```

## 🎨 Features in Detail

### Calendar
- Click any date to create new events
- Click existing events to edit or delete them
- Fixed navbar for easy navigation
- Sticky day headers for better UX

### Todo List
- Access today's tasks via the "..." button on today's date
- Add, edit, and check off tasks
- Press Enter to add new tasks
- Press Backspace on empty task to delete
- Tasks persist across sessions

## 🔧 Technical Highlights

- Event-driven architecture
- Efficient DOM manipulation
- Chrome storage integration for data persistence
- Responsive popup positioning
- Clean separation of concerns

## 📝 Future Improvements

- [ ] Add recurring events
- [ ] Implement event reminders/notifications
- [ ] Add event categories with color coding
- [ ] Week and day view options
- [ ] Export/import data functionality
- [ ] Dark mode toggle

## 👨‍💻 Author

**Elfachry**
- GitHub: [@Elfachry](https://github.com/Elfachry)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built as a learning project to explore Chrome extension development and modern JavaScript practices.*