const Inputs = ({icon: Icon, ...props}) => {
  return (
    <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon className="size-5 text-primary-main" />
        </div>
        <input {...props}
          className="w-full pl-10 pr-3 py-2 bg-card bg-opacity-50 rounded-lg border border-border focus:border-primary-main focus:ring-2 focus:ring-primary-main text-foreground placeholder-muted-foreground transition duration-200" 
        />
    </div>
  )
}

export default Inputs