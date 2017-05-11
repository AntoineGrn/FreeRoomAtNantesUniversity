package freeclassroomuniversity;

public class RoomEntity {
	long id;
	String name;
	String salle;
	String startDate;
	
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getSalle() {
		return salle;
	}
	public void setSalle(String salle) {
		this.salle = salle;
	}
	public String getStartDate() {
		return startDate;
	}
	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}
}
