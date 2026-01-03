import { Bell, Search } from "lucide-react";
import { Badge } from "../ui/badge";

interface HeaderProps {
  title: string;
  userName: string;
}

export function Header({ title, userName }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-accent rounded transition-colors relative">
            <Bell className="w-5 h-5 text-foreground" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground">
              3
            </Badge>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">View Profile</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {userName.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
