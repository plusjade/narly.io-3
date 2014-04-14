class CoursesController < ApplicationController
  def index
    @courses = Course.all
  end

  def show
    @repo = Repo.new(params[:id])
  end
end
