namespace DatingApp.API.Helpers
{
    public class MessageParams
    {
        private int pageSize = 10;
        private const int MaxPageSize = 50;

        public int PageNumber { get; set; } = 1;
        public int PageSize
        {
            get { return pageSize; }
            set { pageSize = value <= MaxPageSize ? value : MaxPageSize; }
        }
        public int UserId { get; set; }
        public string MessageContainer { get; set; } = "Unread";
    }
}