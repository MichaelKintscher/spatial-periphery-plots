# spatial-periphery-plots
# Introduction
This tool is used to give a good view of a dataset and tell all of the details and the periphery plots of the data. Based on the paper _Peripery Plots for Contextualizing Heterongenous Time-Based Charts_ by Bryce Morrow, Trevor Manz, Arlene E. Chung, Nils Gehlenborg, and David Gotz, we are making a tool to give a good detail view on the datset showing a focus and context view. The focus view will show the details of the dataset and the context zone will show the periphery plots. With this tool we will have all the data we need on datasets.
# Instructions
Download the main branch to do testing and see progress. Once that is done, make sure all files were downloaded and open up index.html to see the page.
# Features
At its current state, we have a control map, a minimap, a focus zone, a control panel, and a context zone. The minimap shows the entire graph. It also has a circular mask that is used for the focus zone. The control map holds the focus zone where based on how the user drags the circular mask of the minimap, the focus zone will show a portion of the graph in better detail. The control panel holds the mini map and allows the user to choose the x-attribute, y-attribute, grouping, buttons for zooming, zoom slider, context size slider, and context resoulution slider. The user will be able to choose these attributes and be able to customize the graph and the focus level based on how they like it. The user can also move the graph from the focus zone instead of the circular mask if they wish.
# Limitations
At its current state, the circular mask is not exactly lined up with the focus zone completely on the minimap, but it is easy to move. The zooming is currently working, but there are a few bugs that will need be made to fix them. The context zone is just in a static form, it does overlap the focus zone as it should but it does not change. As more work is made to it, it will no longer be in static form and will change depend on the location of data points.
